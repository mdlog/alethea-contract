# Publishing Guide for @alethea/oracle-sdk

This guide walks through the steps to publish the SDK to npm.

## Prerequisites

1. You must have an npm account. Create one at https://www.npmjs.com/signup if needed.
2. You must be logged in to npm CLI.
3. You must have publish permissions for the `@alethea` scope (or create the scope).

## Pre-Publication Checklist

- [x] TypeScript compilation successful (`npm run build`)
- [x] dist/ directory contains compiled JavaScript and type definitions
- [x] package.json updated with repository, keywords, and license
- [x] .npmignore created to exclude source files and tests
- [x] README.md is comprehensive and up-to-date
- [ ] All tests pass (`npm test`)
- [ ] Version number is correct in package.json

## Publishing Steps

### Step 1: Login to npm

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### Step 2: Verify Package Contents

Before publishing, verify what will be included:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### Step 3: Publish Beta Version

```bash
npm publish --tag beta --access public
```

Notes:
- `--tag beta` publishes as a beta version (users must explicitly install with `@beta`)
- `--access public` is required for scoped packages (@alethea/oracle-sdk)
- The `prepublishOnly` script will automatically run `npm run build`

### Step 4: Verify Publication

After publishing, verify the package is available:

```bash
# Check on npm website
open https://www.npmjs.com/package/@alethea/oracle-sdk

# Or use npm view
npm view @alethea/oracle-sdk@beta
```

### Step 5: Test Installation

Test that the package can be installed:

```bash
# Create a test directory
mkdir -p /tmp/test-alethea-sdk
cd /tmp/test-alethea-sdk

# Initialize a test project
npm init -y

# Install the beta version
npm install @alethea/oracle-sdk@beta

# Verify installation
node -e "const sdk = require('@alethea/oracle-sdk'); console.log('SDK loaded:', !!sdk.AletheaOracleClient)"
```

### Step 6: Test TypeScript Types

```bash
# In the test directory
npm install --save-dev typescript @types/node

# Create a test TypeScript file
cat > test.ts << 'EOF'
import { AletheaOracleClient } from '@alethea/oracle-sdk';

const client = new AletheaOracleClient({
  registryId: 'test',
  chainId: 'test',
});

console.log('TypeScript types working!');
EOF

# Compile it
npx tsc --noEmit test.ts
```

## Publishing Stable Version (Later)

When ready to publish a stable version:

1. Update version in package.json:
   ```bash
   npm version 1.0.0
   ```

2. Publish without beta tag:
   ```bash
   npm publish --access public
   ```

3. Tag the release in git:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Troubleshooting

### Error: 403 Forbidden

- You don't have permission to publish to the `@alethea` scope
- Solution: Either get added to the org or change the package name

### Error: Package already exists

- The version already exists on npm
- Solution: Bump the version number in package.json

### Error: ENEEDAUTH

- You're not logged in
- Solution: Run `npm login`

### Error: E402 Payment Required

- The package name is reserved or requires a paid account
- Solution: Choose a different name or upgrade npm account

## Post-Publication Tasks

1. Announce the release on social media/Discord/Telegram
2. Update documentation website
3. Create GitHub release with changelog
4. Monitor for issues and feedback
5. Respond to GitHub issues promptly

## Unpublishing (Emergency Only)

If you need to unpublish (within 72 hours):

```bash
npm unpublish @alethea/oracle-sdk@1.0.0-beta
```

**Warning:** Unpublishing is discouraged and may be blocked after 72 hours.

## Version Management

Follow semantic versioning:
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

Use npm version commands:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```
