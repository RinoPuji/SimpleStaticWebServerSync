const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');

const sftp = new Client();

// 1. Configuration Setting -------------------------------------------------------------------
// Put you ssh server detail at here 
const config = {
  host: 'server ip or domain',
  port: server ssh port, 
  username: 'ssh_username',
  password: 'ssh_password',
};
//----------------------------------------------------------------------------------------------


// 2. File location ----------------------------------------------------------------------------
const localDir = path.resolve('C:/Users/User/Desktop/staticblog/11ty/_site');
const remoteDir = '/var/www/domain';
//----------------------------------------------------------------------------------------------


// Function to sync files ----------------------------------------------------------------------
async function syncFiles(localDir, remoteDir) {
  try {
    console.log('Connecting to server...');
    await sftp.connect(config);
    console.log('Connected to server.');

    // Recursively upload files and clean remote files
    async function uploadAndCleanDirectory(localPath, remotePath) {
      const localItems = fs.readdirSync(localPath, { withFileTypes: true });
      let remoteItems = [];
      
      try {
        remoteItems = await sftp.list(remotePath);
      } catch (err) {
        console.log(`Remote directory does not exist: ${remotePath}`);
        await sftp.mkdir(remotePath, true);
        console.log(`Created remote directory: ${remotePath}`);
      }

      // Convert remote items to a map for easy lookup
      const remoteItemMap = new Map(remoteItems.map(item => [item.name, item]));

      // Upload local files and directories
      for (const item of localItems) {
        const localItemPath = path.join(localPath, item.name);
        const remoteItemPath = `${remotePath}/${item.name}`;

        if (item.isDirectory()) {
          // Recur for directories
          await uploadAndCleanDirectory(localItemPath, remoteItemPath);
        } else {
          // Upload files
          try {
            await sftp.put(localItemPath, remoteItemPath);
            console.log(`Uploaded: ${localItemPath} -> ${remoteItemPath}`);
          } catch (err) {
            console.error(`Failed to upload: ${localItemPath} -> ${remoteItemPath}`);
            console.error(err.message);
          }
        }

        // Remove processed item from the remote map
        remoteItemMap.delete(item.name);
      }

      // Remove files and directories from remote that don't exist locally
      for (const [remoteItemName, remoteItem] of remoteItemMap) {
        const remoteItemPath = `${remotePath}/${remoteItemName}`;
        if (remoteItem.type === 'd') {
          // Recursive removal for directories
          try {
            await sftp.rmdir(remoteItemPath, true);
            console.log(`Removed remote directory: ${remoteItemPath}`);
          } catch (err) {
            console.error(`Failed to remove remote directory: ${remoteItemPath}`);
            console.error(err.message);
          }
        } else {
          // Remove file
          try {
            await sftp.delete(remoteItemPath);
            console.log(`Removed remote file: ${remoteItemPath}`);
          } catch (err) {
            console.error(`Failed to remove remote file: ${remoteItemPath}`);
            console.error(err.message);
          }
        }
      }
    }

    await uploadAndCleanDirectory(localDir, remoteDir);

    console.log('File synchronization completed.');
  } catch (err) {
    console.error('Error during synchronization:', err.message);
  } finally {
    sftp.end();
    console.log('Connection closed.');
  }
}

// Execute sync
syncFiles(localDir, remoteDir);
