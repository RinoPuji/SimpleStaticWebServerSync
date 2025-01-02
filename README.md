# SimpleStaticWebServerSync
A simple script to sync between nginx web server and local static generated `_site` using Node.js

This is just my personal script to sync between nginx web server and my static 11ty blog from local window.For a large website or blog,its better to use another tools like Rsync for fast performance.

### 1.Requirement
Make sure Node.js is already installed on our window machine : <https://nodejs.org/en/download>

### 2.Add Node.js to windows path environment variable
If you are using windows installer,the end of installation should give you pop up either you wan to add Node.js to environment variable.You can double check using this comment on cmd or visual studio code terminal : 
```bash
node -v
```
If your environment path for Node is done correctly,you should get node version as a result,for example : 
```bash
v20.16.0
```

### 3.Configuration
Put our ssh details at `const config`
```js
const config = {
  host: 'server ip or domain',
  port: ssh server port;
  username: 'username_for_ssh',
  password: 'ssh_password',
};
```
Put our `_static` generated static site from window local machine path and our server web server path :
```js
const localDir = path.resolve('C:/Users/User/Desktop/staticblog/11ty/_site');
const remoteDir = '/var/www/domain';
```

### 4.Run sync 
Now we can sync our file from local window machine to web server using this script through node :
```batch
node sync.js
```
