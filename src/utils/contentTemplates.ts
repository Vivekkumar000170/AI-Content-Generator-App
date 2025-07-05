import { ContentRequest, GeneratedContent } from '../types';
import { generateAIContent } from '../services/openai';
import { generateImage } from '../services/imageGeneration';
import { useAuth } from '../contexts/AuthContext';

export const generateContent = async (request: ContentRequest): Promise<GeneratedContent> => {
  try {
    // Generate text content
    const content = await generateAIContent(request);
    const title = generateTitle(request);
    
    // Generate image for ad-copy and social-media content types
    let image;
    if (request.type === 'ad-copy' || request.type === 'social-media') {
      try {
        image = await generateImage(request.type, request.topic, request.platform, request.tone);
      } catch (imageError) {
        console.warn('Image generation failed, continuing without image:', imageError);
        // Don't throw error, just continue without image
      }
    }
    
    // Simulate updating user usage (word count)
    const wordCount = content.split(' ').length;
    updateUserWordUsage(wordCount);
    
    return {
      title,
      content,
      type: request.type,
      timestamp: new Date(),
      image
    };
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Fallback to template-based generation
    return generateFallbackContent(request);
  }
};

// Function to update user's word usage
const updateUserWordUsage = (wordCount: number) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.usage.wordsGenerated += wordCount;
      localStorage.setItem('user', JSON.stringify(user));
      
      // Dispatch custom event to update auth context
      window.dispatchEvent(new CustomEvent('userUsageUpdated', { 
        detail: { wordsGenerated: user.usage.wordsGenerated } 
      }));
    }
  } catch (error) {
    console.error('Failed to update user usage:', error);
  }
};

// Generate appropriate title based on content type
const generateTitle = (request: ContentRequest): string => {
  switch (request.type) {
    case 'seo-blog':
      const blogTypeText = request.blogType === 'humanized' ? 'Humanized SEO' : 'SEO';
      return `${request.topic} - ${blogTypeText} Blog Article`;
    case 'product-description':
      return `${request.productName || request.topic} - Product Description`;
    case 'ad-copy':
      return `${request.topic} - Complete ${request.platform || 'Ad'} Campaign Package`;
    case 'social-media':
      return `${request.topic} - ${request.platform || 'Social Media'} Post`;
    case 'poster':
      return `${request.topic} - AI Generated Poster`;
    case 'banner':
      return `${request.topic} - AI Generated Banner`;
    default:
      return `${request.topic} - Generated Content`;
  }
};

// Fallback content generation (enhanced template system)
const generateFallbackContent = async (request: ContentRequest): Promise<GeneratedContent> => {
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
      content = generateDetailedAdCopyFallback(request);
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
  
  // Generate fallback image for ad-copy and social-media
  let image;
  if (request.type === 'ad-copy' || request.type === 'social-media') {
    try {
      image = await generateImage(request.type, request.topic, request.platform, request.tone);
    } catch (error) {
      console.warn('Fallback image generation failed:', error);
      // Continue without image
    }
  }
  
  // Update word usage for fallback content too
  const wordCount = content.split(' ').length;
  updateUserWordUsage(wordCount);
  
  return {
    title,
    content,
    type: request.type,
    timestamp: new Date(),
    image
  };
};

const generateDetailedAdCopyFallback = (request: ContentRequest): string => {
  return `# Complete ${request.platform || 'Ad'} Campaign Package: ${request.topic}

## 🎯 CAMPAIGN STRATEGY OVERVIEW

**Target Audience:** ${request.targetAudience || 'Professionals and businesses seeking growth'}
**Platform:** ${request.platform || 'Google Ads'}
**Tone:** ${request.tone || 'Professional yet approachable'}

**Key Messaging Strategy:**
- Focus on immediate value and results
- Address pain points directly
- Emphasize unique competitive advantages
- Create urgency without being pushy

## 📝 PRIMARY AD VARIATIONS

### Ad Variation #1: Problem-Solution Focus
**Headlines:**
- "Struggling with ${request.topic}? Here's Your Solution"
- "Finally! A Better Way to Handle ${request.topic}"
- "Stop Wasting Time on ${request.topic} - Try This Instead"

**Body Copy:**
Transform your approach to ${request.topic} with our proven solution. Join thousands of satisfied customers who've already made the switch.

✅ Immediate results
✅ Expert support included
✅ Risk-free 30-day trial

**Call-to-Action:** "Get Started Today - Free Trial"

### Ad Variation #2: Benefit-Driven Approach
**Headlines:**
- "Boost Your ${request.topic} Results by 300%"
- "The #1 ${request.topic} Solution Trusted by Professionals"
- "Unlock Your ${request.topic} Potential in Just 5 Minutes"

**Body Copy:**
Discover why leading professionals choose our ${request.topic} solution. Advanced features, simple setup, and results you can measure.

🚀 Fast implementation
🎯 Proven results
💪 Dedicated support team

**Call-to-Action:** "See Results Now - Start Free"

### Ad Variation #3: Social Proof & Authority
**Headlines:**
- "Join 50,000+ Professionals Using This ${request.topic} Tool"
- "The ${request.topic} Solution Recommended by Industry Experts"
- "Why Top Companies Choose Us for ${request.topic}"

**Body Copy:**
Don't just take our word for it. See why industry leaders trust us with their ${request.topic} needs. Award-winning solution with 24/7 support.

⭐ 4.9/5 star rating
🏆 Industry awards
📈 Proven ROI

**Call-to-Action:** "Join the Leaders - Try Free"

## 🎨 PLATFORM-SPECIFIC OPTIMIZATIONS

### ${request.platform || 'Google Ads'} Specifications:
- **Character Limits:** Headlines (30 chars), Descriptions (90 chars)
- **Ad Extensions:** Sitelinks, Callouts, Structured snippets
- **Keywords:** Focus on high-intent, commercial keywords
- **Bidding:** Start with Target CPA, optimize to Target ROAS

### Targeting Recommendations:
- **Demographics:** Age 25-55, College educated, Household income $50K+
- **Interests:** Business software, Professional development, Industry publications
- **Behaviors:** Frequent business tool users, Decision makers, Budget holders

## 🧠 PSYCHOLOGICAL TRIGGERS & PERSUASION TECHNIQUES

**Scarcity:** "Limited time offer" and "While supplies last"
**Social Proof:** Customer testimonials and usage statistics
**Authority:** Industry certifications and expert endorsements
**Reciprocity:** Free trials and valuable content offers
**Loss Aversion:** "Don't miss out" and "What you're losing by waiting"

## 🔬 A/B TESTING RECOMMENDATIONS

**Test Elements:**
1. Headlines (emotional vs. rational)
2. Call-to-action buttons (color, text, placement)
3. Value propositions (features vs. benefits)
4. Social proof elements (numbers, testimonials)
5. Urgency levels (high vs. moderate)

**Success Metrics:**
- Click-through rate (CTR)
- Conversion rate
- Cost per acquisition (CPA)
- Return on ad spend (ROAS)
- Quality Score (for Google Ads)

## 🎯 LANDING PAGE ALIGNMENT

**Key Messages to Maintain:**
- Consistent value proposition
- Same offer/promotion
- Matching visual style
- Clear conversion path

**Optimization Tips:**
- Mobile-first design
- Fast loading speed (under 3 seconds)
- Clear headline above the fold
- Single, prominent call-to-action
- Trust signals (testimonials, security badges)

## 💰 BUDGET & PERFORMANCE EXPECTATIONS

**Recommended Budget Allocation:**
- Testing Phase: $500-1,000/month
- Scaling Phase: $2,000-5,000/month
- Optimization Phase: Based on profitable ROAS

**Expected Performance Benchmarks:**
- CTR: 2-4% (industry average)
- Conversion Rate: 3-5%
- CPA: $50-150 (varies by industry)
- ROAS: 3:1 minimum target

**Scaling Strategies:**
1. Increase budget on winning ad variations
2. Expand to similar audiences
3. Test new platforms with proven creative
4. Develop lookalike audiences from converters

## 📊 CAMPAIGN MONITORING & OPTIMIZATION

**Daily Checks:**
- Budget pacing
- Quality Score changes
- New negative keywords needed

**Weekly Reviews:**
- Performance by ad variation
- Audience segment analysis
- Competitor activity monitoring

**Monthly Optimizations:**
- Creative refresh
- Landing page improvements
- Audience expansion testing
- Budget reallocation based on performance

---

**Next Steps:**
1. Set up tracking and analytics
2. Create landing pages aligned with ad messaging
3. Launch with small budget for testing
4. Monitor performance and optimize based on data
5. Scale successful campaigns gradually

This comprehensive campaign package provides everything needed for a successful ${request.topic} advertising campaign on ${request.platform || 'Google Ads'}. Implement systematically and optimize based on real performance data.`;
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