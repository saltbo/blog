## CORS



### GoogleStorage

```bash
echo '[{"origin":["*"],"method":["PUT"],"responseHeader":["content-type","x-amz-acl"]}]' > cors.json
gsutil cors set cors.json gs://your-bucket-name
```

