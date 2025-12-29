/**
 * Late API posting script
 * Posts rendered video to specified platforms via Late (getlate.dev)
 *
 * Supports two modes:
 * - dailyBLEND/PodcastShort: Uses POST_CONTENT_B64 and PLATFORMS_JSON_B64
 * - Trivia2: Uses PROPS_PATH and PLATFORMS
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.LATE_API_URL || 'https://getlate.dev/api/v1';

function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

async function main() {
  const apiKey = process.env.LATE_API_KEY;
  const jobId = process.env.JOB_ID || `post-${Date.now()}`;

  // Determine mode based on environment variables
  const isDailyBlend = !!process.env.POST_CONTENT_B64;

  let videoPath, platforms, platformsConfig, content;

  if (isDailyBlend) {
    // dailyBLEND/PodcastShort mode
    console.log('=== Late API Post (dailyBLEND mode) ===');
    videoPath = process.env.VIDEO_PATH || path.join(__dirname, '..', 'out', 'video.mp4');

    // Decode Base64 content
    try {
      content = decodeBase64(process.env.POST_CONTENT_B64);
    } catch (e) {
      console.error('ERROR: Failed to decode POST_CONTENT_B64:', e.message);
      process.exit(1);
    }

    // Decode Base64 platforms config (preserve full objects with accountId)
    try {
      platformsConfig = JSON.parse(decodeBase64(process.env.PLATFORMS_JSON_B64));
      if (!Array.isArray(platformsConfig)) {
        platformsConfig = [];
      }
      // Extract platform names for logging
      platforms = platformsConfig.map(p => typeof p === 'string' ? p : p.platform).filter(Boolean);
    } catch (e) {
      console.error('ERROR: Failed to decode PLATFORMS_JSON_B64:', e.message);
      process.exit(1);
    }
  } else {
    // Trivia2 mode
    console.log('=== Late API Post (Trivia2 mode) ===');
    videoPath = process.env.VIDEO_PATH || path.join(__dirname, '..', 'out', 'trivia2.mp4');
    const platformsStr = process.env.PLATFORMS || 'instagram';
    platforms = platformsStr.split(',').map(p => p.trim()).filter(Boolean);
    const propsPath = process.env.PROPS_PATH || path.join(__dirname, '..', 'props.json');

    // Read props for content
    let hashtags = [];
    if (fs.existsSync(propsPath)) {
      try {
        const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));
        const words = props.words || [];
        const text = words.map(w => w.word).join('');
        const description = props.description || '';
        content = `${text}\n\n${description}`;
        hashtags = ['トリビア', '豆知識', '雑学', 'shorts', 'ショート'];
        const hashtagStr = hashtags.map(t => `#${t}`).join(' ');
        content = `${content}\n\n${hashtagStr}`;
      } catch (e) {
        console.warn('Could not parse props.json:', e.message);
      }
    }

    if (!content) {
      content = 'トリビアの泉 #トリビア #豆知識 #shorts';
    }
  }

  console.log(`Video: ${videoPath}`);
  console.log(`Platforms: ${platforms.join(', ')}`);
  console.log(`Content preview: ${content.substring(0, 100)}...`);

  if (!apiKey) {
    console.error('ERROR: LATE_API_KEY not provided');
    process.exit(1);
  }

  if (platforms.length === 0) {
    console.log('No platforms specified, skipping');
    process.exit(0);
  }

  // Check video exists
  if (!fs.existsSync(videoPath)) {
    console.error(`ERROR: Video not found at ${videoPath}`);
    process.exit(1);
  }

  const fileSize = fs.statSync(videoPath).size;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  console.log(`\nUploading to Late API...`);
  console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Step 1: Get presigned URL
    console.log('1. Getting presigned URL...');
    const presignRes = await fetch(`${BASE_URL}/media/presign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filename: `${jobId}.mp4`,
        contentType: 'video/mp4',
        size: fileSize
      })
    });

    if (!presignRes.ok) {
      const errorText = await presignRes.text();
      throw new Error(`Presign failed (${presignRes.status}): ${errorText}`);
    }

    const presignData = await presignRes.json();
    const uploadUrl = presignData.uploadUrl;
    const mediaUrl = presignData.publicUrl;
    console.log(`   Media URL: ${mediaUrl}`);

    // Step 2: Upload video
    console.log('2. Uploading video...');
    const videoBuffer = fs.readFileSync(videoPath);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: videoBuffer
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed (${uploadRes.status})`);
    }
    console.log('   Upload complete');

    // Step 3: Create post
    console.log('3. Creating posts...');

    // For dailyBLEND mode, use full platform config with accountId
    // For Trivia2 mode, use simple platform names
    const platformsPayload = isDailyBlend
      ? platformsConfig
      : platforms.map(p => ({ platform: p }));

    console.log(`   Platforms payload: ${JSON.stringify(platformsPayload)}`);

    const postRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: content,
        status: 'published',
        platforms: platformsPayload,
        mediaItems: [{ type: 'video', url: mediaUrl }]
      })
    });

    if (!postRes.ok) {
      const errorText = await postRes.text();
      console.error(`   Failed to post: ${errorText}`);
    } else {
      const postData = await postRes.json();
      console.log(`   ✓ Posted successfully`);
      if (postData.postUrl) {
        console.log(`     URL: ${postData.postUrl}`);
      }
    }

    console.log('\n✓ All done!');
    process.exit(0);

  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

main();
