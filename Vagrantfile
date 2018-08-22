# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.provision :shell do |s|
    s.name = 'apt-get update'
    s.inline = 'apt-get update'
  end

  config.vm.provision :shell do |s|
    s.name = 'install nvm'
    s.inline = 'curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash'
    s.privileged = false
  end

  config.vm.provision :shell do |s|
    s.name = 'install node'
    s.inline = 'source /home/vagrant/.nvm/nvm.sh && cd /vagrant && nvm install'
    s.privileged = false
  end

  config.vm.provision :shell do |s|
    s.name = 'librarian-puppet install'
    s.inline = 'cd /vagrant/puppet && librarian-puppet install --path=./modules'
  end

  config.vm.provision :puppet do |puppet|
    puppet.working_directory = '/vagrant'
    puppet.manifests_path = './puppet'
    puppet.manifest_file = 'site.pp'
    puppet.options = '--debug --detailed-exitcodes --modulepath ./puppet/modules'
    puppet.environment = VagrantPlugins::NSIDC::Plugin.environment
    puppet.environment_path = './puppet/environments'
    puppet.hiera_config_path = './puppet/hiera.yaml'
  end
end
