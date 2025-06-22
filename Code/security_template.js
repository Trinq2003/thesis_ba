export function generateHttpSecurityCode(): string {
    const schemeName = 'schemeName'; // Placeholder, will be replaced in template
    return `
      else if (scheme?.type === 'http') {
          if (scheme.scheme?.toLowerCase() === 'bearer') {
              const token = process.env[\`${getEnvVarName(schemeName, 'BEARER_TOKEN')}\`];
              if (token) {
                  headers['authorization'] = \`Bearer \${token}\`;
              }
          } 
          else if (scheme.scheme?.toLowerCase() === 'basic') {
              const username = process.env[\`${getEnvVarName(schemeName, 'BASIC_USERNAME')}\`];
              const password = process.env[\`${getEnvVarName(schemeName, 'BASIC_PASSWORD')}\`];
              if (username && password) {
                  headers['authorization'] = \`Basic \${Buffer.from(\`\${username}:\${password}\`).toString('base64')}\`;
              }
          }
      }`;
  }