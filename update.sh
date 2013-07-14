sudo git pull origin master
cd ..
sudo rm *.php
sudo cp -rs EventCloud/*.php .
sudo chown -R apache:www-data *
