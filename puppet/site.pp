# Load modules and classes
lookup('classes', {merge => unique}).include


exec { 'setup node':
  command => 'curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && sudo apt-get install -y nodejs',
  path    => '/usr/bin'
}
