#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');

if(process.argv.length  < 3) {
    console.log(`
    Usage:
    sslf domain [sub] [sub] ...

    For example:
    sslf example.com www staging

    1. Would create a self signed certificate for example.com, www.example.com and staging.example.com
    2. Would be stored in /etc/letsencrypt/live/example.com
    3. Would be added to trusted certificates in keychain.
`);
    process.exit(1);
}

const [,,domain] = process.argv;

const altNames = [ domain, ...process.argv.slice(3).map(add => `${add}.${domain}`) ];
const altNamesSection = altNames.map((name,i) => `DNS.${i+1} = ${name}`).join('\n');

const reqPath = path.join(os.tmpdir(), Math.random().toString().split('.')[1]) + '.conf';
const req = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no
[req_distinguished_name]
C = US
ST = VA
L = SomeCity
O = MyCompany
OU = MyDivision
CN = ${domain}
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
${altNamesSection}
`.trim();

fs.writeFileSync(reqPath, req);

const sslFolder = `/etc/letsencrypt/live/${domain}`;
if(!fs.existsSync(sslFolder)) {
    child_process.execSync(`sudo mkdir -p ${sslFolder}`, { stdio:'inherit' });
}

const certPath = `${sslFolder}/fullchain.pem`;
const keyPath = `${sslFolder}/privkey.pem`;

const cmd = [
    'sudo',
    `openssl req -x509 -nodes`,
    `-days 730`,
    `-newkey rsa:2048`,
    `-keyout ${keyPath}`,
    `-out ${certPath}`,
    `-config ${reqPath}`,
    `-extensions 'v3_req'`
].join(' ');

child_process.execSync(cmd, { stdio:'inherit' });
fs.unlinkSync(reqPath);

child_process.execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`, {
    stdio:'inherit',
});
