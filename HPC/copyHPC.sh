s3cmd put FILE $1 s3://eventfulcloud-app 
./sendHPC.sh "s3cmd get s3://eventfulcloud-app/$1"
s3cmd del s3://eventfulcloud-app/$1
