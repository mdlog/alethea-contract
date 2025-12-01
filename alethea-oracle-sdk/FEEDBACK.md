# Alethea Oracle SDK - Feedback & Support

Thank you for using the Alethea Oracle SDK! Your feedback helps us improve the SDK and make it better for everyone.

## Ways to Provide Feedback

### 1. GitHub Issues
The primary way to report bugs, request features, or ask questions:

**Report a Bug**: [Create Bug Report](https://github.com/your-org/alethea-network/issues/new?template=bug_report.md)
**Request a Feature**: [Create Feature Request](https://github.com/your-org/alethea-network/issues/new?template=feature_request.md)
**Ask a Question**: [Create Discussion](https://github.com/your-org/alethea-network/discussions/new)

### 2. Quick Feedback Form
For quick feedback, use our online form: [SDK Feedback Form](https://forms.gle/your-form-id)

### 3. Community Channels
- **Discord**: Join our [Discord server](https://discord.gg/your-invite)
- **Twitter**: Follow [@AletheaNetwork](https://twitter.com/AletheaNetwork)
- **Email**: sdk-feedback@alethea.network

## What We're Looking For

### Bug Reports
When reporting bugs, please include:
- SDK version (`npm list @alethea/oracle-sdk`)
- Node.js version (`node --version`)
- Operating system
- Code snippet that reproduces the issue
- Expected vs actual behavior
- Error messages and stack traces

### Feature Requests
When requesting features, please describe:
- The problem you're trying to solve
- Your proposed solution
- Alternative solutions you've considered
- How this would benefit other users

### General Feedback
We'd love to hear about:
- Your use case and how you're using the SDK
- What you like about the SDK
- What could be improved
- Documentation clarity
- API design and ergonomics
- Performance issues

## Common Issues & Solutions

### Issue: "Cannot connect to Registry"
**Solution**: Ensure the Registry endpoint is correct and accessible. Check your `OracleConfig`:
```typescript
const client = new AletheaOracleClient({
    registryId: 'your-registry-id',
    chainId: 'your-chain-id',
    endpoint: 'http://localhost:8080', // Verify this is correct
});
```

### Issue: "Insufficient fee" error
**Solution**: The registration fee depends on the number of outcomes and deadline. Use a higher fee or check the required fee calculation.

### Issue: "Market not found" after registration
**Solution**: Market registration is asynchronous. Wait a few seconds and retry, or use the subscription mechanism:
```typescript
const unsubscribe = await client.subscribeToResolution(
    marketId,
    (resolution, error) => {
        if (resolution) {
            console.log('Market resolved:', resolution);
        }
    }
);
```

### Issue: TypeScript type errors
**Solution**: Ensure you're using TypeScript 4.5+ and have the latest SDK version:
```bash
npm install @alethea/oracle-sdk@latest
```

## Feedback Statistics

We track and prioritize feedback based on:
- **Frequency**: How many users report the same issue
- **Impact**: How severely it affects users
- **Complexity**: How difficult it is to implement
- **Alignment**: How well it fits our roadmap

## Response Times

We aim to:
- **Acknowledge** all feedback within 24 hours
- **Triage** bugs within 48 hours
- **Fix critical bugs** within 1 week
- **Implement features** based on priority and complexity

## Recent Feedback & Actions

### Beta Testing Feedback (v1.0.0-beta)

#### Implemented
✅ Added retry logic with exponential backoff (v1.0.0-beta.2)
✅ Improved error messages with actionable guidance (v1.0.0-beta.3)
✅ Added parameter validation before API calls (v1.0.0-beta.4)
✅ Enhanced TypeScript type definitions (v1.0.0-beta.5)

#### In Progress
🔄 Add WebSocket support for real-time updates
🔄 Implement batch market registration
🔄 Add market cancellation support

#### Planned
📋 Add React hooks for easier integration
📋 Create Vue.js plugin
📋 Add comprehensive examples for common use cases
📋 Improve documentation with video tutorials

## Contributing

Want to contribute directly? Check out our [Contributing Guide](../CONTRIBUTING.md).

### Areas Where We Need Help
- **Documentation**: Improve examples, tutorials, and API docs
- **Testing**: Add more test cases and edge case coverage
- **Examples**: Create real-world integration examples
- **Tooling**: Build developer tools and utilities

## Feedback Incentives

We appreciate quality feedback! Contributors who provide valuable feedback may receive:
- Recognition in our changelog and release notes
- Early access to new features
- Alethea Network swag
- Community contributor badge

## Privacy

We respect your privacy:
- Feedback is used solely to improve the SDK
- Personal information is not shared with third parties
- You can request deletion of your feedback at any time

## Thank You!

Your feedback makes the Alethea Oracle SDK better for everyone. We're grateful for your time and input!

---

**Last Updated**: November 2025
**SDK Version**: 1.0.0-beta
**Maintainers**: Alethea Network Team
