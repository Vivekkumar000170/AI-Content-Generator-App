import { ContentRequest, GeneratedContent } from '../types';
import { generateAIContent } from '../services/openai';

export const generateContent = async (request: ContentRequest): Promise<GeneratedContent> => {
  try {
    const content = await generateAIContent(request);
    
    // Generate appropriate title based on content type
    const title = generateTitle(request);
    
    return {
      title,
      content,
      type: request.type,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Fallback to template-based generation if API fails
    return generateFallbackContent(request);
  }
};

const generateTitle = (request: ContentRequest): string => {
  switch (request.type) {
    case 'seo-blog':
      const blogTypeText = request.blogType === 'humanized' ? 'Humanized SEO' : 'SEO';
      return `${request.topic} - ${blogTypeText} Blog Article`;
    case 'product-description':
      return `${request.productName || request.topic} - Product Description`;
    case 'ad-copy':
      return `${request.topic} - ${request.platform || 'Ad'} Copy`;
    case 'social-media':
      return `${request.topic} - ${request.platform || 'Social Media'} Post`;
    default:
      return `${request.topic} - Generated Content`;
  }
};

// Fallback content generation (original template system)
const generateFallbackContent = (request: ContentRequest): GeneratedContent => {
  const title = generateTitle(request);
  
  let content = '';
  
  switch (request.type) {
    case 'seo-blog':
      const isHumanized = request.blogType === 'humanized';
      content = isHumanized ? generateHumanizedBlog(request) : generateStandardBlog(request);
      break;
      
    case 'product-description':
      content = `# ${request.productName || request.topic}

**Transform your experience with our premium solution.**

## Key Features
${request.features ? request.features.split(',').map(f => `• ${f.trim()}`).join('\n') : '• Premium quality\n• User-friendly design\n• Reliable performance'}

## Benefits
${request.benefits ? request.benefits.split(',').map(b => `✓ ${b.trim()}`).join('\n') : '✓ Saves time\n✓ Increases productivity\n✓ Delivers results'}

**Ready to get started? Contact us today!**`;
      break;
      
    case 'ad-copy':
      content = `🚀 Discover ${request.topic}!

Transform your approach with our proven solution.

✅ Immediate results
✅ Expert support  
✅ Risk-free trial

Ready to get started?
👆 Click to learn more!`;
      break;
      
    case 'social-media':
      content = `💡 Let's talk about ${request.topic}!

As ${request.targetAudience || 'professionals'}, we know how important it is to stay ahead.

Key insights:
🔹 Strategic approach matters
🔹 Consistency drives results
🔹 Focus on value creation

What's your experience? Share in the comments! 👇

#${request.topic.replace(/\s+/g, '')} #Business #Growth`;
      break;
  }
  
  return {
    title,
    content,
    type: request.type,
    timestamp: new Date()
  };
};

const generateStandardBlog = (request: ContentRequest): string => {
  return `# ${request.topic}: A Comprehensive Guide

## Introduction

Understanding ${request.topic} is essential in today's competitive landscape. This guide provides valuable insights and actionable strategies for ${request.targetAudience || 'businesses and professionals'}.

## Key Points

- Important aspect 1 of ${request.topic}
- Critical consideration 2 for success
- Best practices and proven strategies
- Common challenges and how to overcome them

## Why ${request.topic} Matters

In the current market environment, ${request.topic} has become increasingly important. Organizations that master this area often see significant improvements in their overall performance.

## Best Practices

1. **Strategic Planning**: Develop a clear roadmap
2. **Implementation**: Execute with precision
3. **Monitoring**: Track progress and adjust as needed
4. **Optimization**: Continuously improve your approach

## Conclusion

${request.topic} offers significant opportunities when approached strategically. By implementing these insights and maintaining a focus on continuous improvement, you can achieve better results and stay ahead of the competition.

*Keywords: ${request.keywords || 'strategy, implementation, optimization, success'}*`;
};

const generateHumanizedBlog = (request: ContentRequest): string => {
  return `# ${request.topic}: What You Need to Know

Hey there! Let's dive into something that's been on my mind lately - ${request.topic}. I've been working with ${request.targetAudience || 'businesses'} for years now, and I keep seeing the same patterns emerge.

## My Take on ${request.topic}

You know what? When I first started exploring ${request.topic}, I thought it was just another buzzword. Boy, was I wrong! It turns out this stuff actually matters - and here's why.

The thing is, most people approach ${request.topic} all wrong. They think it's about following some rigid formula, but that's not how real success works. Let me share what I've learned from working with dozens of clients.

## What Actually Works (From Real Experience)

I remember working with a client last year who was struggling with exactly this issue. They'd tried everything - or so they thought. But when we dug deeper, we discovered they were missing some fundamental pieces.

Here's what made the difference:

**The Human Element**: People forget that behind every strategy, there are real humans making real decisions. You can't just throw technology at a problem and expect it to solve itself.

**Timing Matters**: I've seen brilliant strategies fail simply because the timing was off. Sometimes you need to wait for the right moment, and sometimes you need to create that moment yourself.

**Consistency Over Perfection**: This one's huge. I'd rather see someone execute a decent plan consistently than chase the "perfect" solution that never gets implemented.

## Common Mistakes I See All the Time

Look, I'm not here to sugarcoat things. I've made plenty of mistakes myself, and I've watched others make them too. Here are the big ones:

- Overthinking the initial setup (just start somewhere!)
- Ignoring feedback from actual users
- Trying to copy what worked for someone else without adapting it
- Getting distracted by shiny new tools instead of mastering the basics

## What's Working Right Now

Based on what I'm seeing with current clients, here are the approaches that are actually moving the needle:

1. **Start Small, Think Big**: Begin with one focused area and expand from there
2. **Listen More Than You Talk**: Your audience will tell you what they need if you pay attention
3. **Test Everything**: Don't assume - validate your ideas with real data
4. **Build Relationships**: This isn't just about tactics; it's about connecting with people

## My Honest Assessment

Here's the truth: ${request.topic} isn't a magic bullet. It's not going to solve all your problems overnight. But if you approach it with the right mindset and realistic expectations, it can absolutely make a meaningful difference.

I've seen companies transform their entire approach after getting this right. Not because they found some secret hack, but because they committed to doing the work consistently and authentically.

## Where to Go From Here

If you're just getting started, don't try to boil the ocean. Pick one aspect of ${request.topic} that resonates with you and focus on that for the next 30 days. See what happens. Learn from it. Then build on that foundation.

And remember - this stuff evolves constantly. What works today might need tweaking tomorrow. Stay curious, stay flexible, and don't be afraid to adjust course when needed.

What's your experience been with ${request.topic}? I'd love to hear your thoughts in the comments below.

---

*P.S. If you found this helpful, you might also want to check out my thoughts on ${request.keywords ? request.keywords.split(',')[0] : 'related topics'}. It's all connected, and understanding these relationships can really accelerate your progress.*`;
};