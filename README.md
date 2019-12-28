# sslf
> Generate and trust a self signed certificate on macOS.

## Install
```
npm i -g sslf
```

## Usage

```
sslf domain [sub] [sub] ...
```

For example:
```
sslf example.com www staging
```

1. Would create a self signed certificate for example.com, www.example.com and staging.example.com
2. Would be stored in /etc/letsencrypt/live/example.com
3. Would be added to trusted certificates in keychain.


## Why asking for a password?
An admin password required in the process because of:

- writing in the now protected /etc directory
- trusting the certificate
