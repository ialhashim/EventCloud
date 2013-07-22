# Create job
jobScript=job-$RANDOM-$RANDOM-$RANDOM.sh

cmd+="cd EventCloud;"
cmd+="./makeEvent.sh $1 $2;"
cmd+="cd output/1/pmvs/models;"
cmd+="../../../../CMVS-PMVS/bin/ply2json option-0000.ply;"
cmd+="cd ../../../..;"
cmd+="./uploadToCloud.sh $1"

echo $cmd > $jobScript

echo "Job: $cmd"

# Send job and execute
./copyHPC.sh $jobScript
./sendHPC.sh "sh $jobScript"

# Clean up
rm $jobScript
