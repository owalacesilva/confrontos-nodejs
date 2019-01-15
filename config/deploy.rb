# config valid for current version and patch releases of Capistrano
lock "~> 3.10.1"

# Application name
set :application, "confrontos-server"

# Default deploy_to directory
set :deploy_to, "/home/ubuntu/#{fetch(:application)}"

# Configuration Bitbucket Repository URL
set :repo_url, 'git@bitbucket.org:confrontos/confrontos-server.git'
set :branch, 'master'
set :repo_path, "#{fetch(:deploy_to)}/repo"

# Default value for :linked_files is []
append :linked_files, "config/secrets.json", ".env"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/uploads"

# Default tmp deploy directory
set :tmp_dir, '/tmp/capistrano'

# set :npm_target_path, -> { release_path.join('subdir') } # default not set
set :npm_flags, '--production --silent --no-progress' # default
set :npm_roles, :all # default
set :npm_env_variables, {} # default

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
# set :pty, true

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
# set :local_user, -> { `git config user.name`.chomp }

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure