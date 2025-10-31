# bash commands
ls newdir
ls -l
 ls -R newdir
 ls -lta newdir
 ls -lr newdir
 ls -s newdir
 ls -lR | grep .json
  ls xoo*


  ---
  mkdir -p newdir/subdir
  cp -r newdir/subdir newdir/subdir2
  rm -r folder
  chmod +R ugo-rwx newdir
  chmod u+x file.txt

  head -20 file.txt
  tail -n 20 file.txt | head -n 10
  wc file.txt
  grep "hii" | wc -l
  grep -c "hii" file.txt
  grep -h "hii" file.txt
  grep -rn "hii" .
  grep -o "hii" file.txt | wc -l
  grep -w "hii" file.txt | wc -l
  grep 'error' log.txt 
  grep 'error' -v log.txt 
   grep -A 3 "error" log.txt 
   grep -B 3 "error" log.txt 
   grep -C 3 "error" log.txt 
   sed -n '/error/p' log.txt
   sed -n 's/error/Critical' log.txt
sed -ibackup 's/error/Critical/' log.txt
sed -i '3,7 s/error/Critical/' log.txt






