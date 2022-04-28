# Load modules and classes
lookup('classes', {merge => unique}).include

$project = lookup('project')
$app_root = '/var/www/html/data-access-tools'
$source_dir = '/vagrant/dist'

class { 'nodejs':
  version => 'latest',
 }

exec { 'apt-get update':
  command => 'sudo apt-get update',
  path => ['/usr/bin'],
}

# Configure a very basic nginx instance for development/integration/staging use.
# The app will be deployed as a bundled Javascript artifact, *not* via a
# blue-green VM swap.
include nginx

nginx::resource::vhost { 'data-access-tools':
  ensure      => present,
  server_name => ['data-access-tools.org'],
  listen_port => 80,
  www_root => $app_root
}

# Copy javascript artifacts to an nginx-served location
file {'deploy_app':
  path => $app_root,
  ensure => directory,
  source => $source_dir,
  recurse => true,
  ignore => "*png",
  owner => 'vagrant',
  group => 'vagrant'
}
