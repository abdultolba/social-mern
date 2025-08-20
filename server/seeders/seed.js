import { User, Post, Comment, sequelize } from "../models/index.js";
import { hash } from "bcryptjs";
import LinkPreview from "../services/linkPreview.js";
import { promises } from "fs";
const fsp = promises;
import { resolve } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data arrays
const maleFirstNames = [
  "Liam",
  "Noah",
  "William",
  "James",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
  "Mason",
  "Michael",
  "Ethan",
  "Daniel",
  "Jacob",
  "Logan",
  "Jackson",
  "Levi",
  "Sebastian",
  "Mateo",
  "Jack",
  "Alex",
];
const femaleFirstNames = [
  "Emma",
  "Olivia",
  "Sophia",
  "Isabella",
  "Charlotte",
  "Amelia",
  "Mia",
  "Harper",
  "Evelyn",
  "Abigail",
  "Emily",
  "Elizabeth",
  "Sofia",
  "Avery",
  "Ella",
  "Scarlett",
  "Grace",
  "Chloe",
  "Victoria",
  "Riley",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
];

const genericPosts = [
  "Just had the most amazing coffee this morning! ☕",
  "Beautiful sunset today 🌅 Nature never fails to amaze me",
  "Weekend vibes are the best vibes 😎",
  "Learning something new every day 📚",
  "Grateful for all the wonderful people in my life ❤️",
  "Pizza night with friends! 🍕",
  "Morning jog complete! Ready to tackle the day 🏃‍♂️",
  "Rainy day = perfect reading weather 📖☔",
  "Can't believe it's already Friday! Time flies ⏰",
  "Just finished a great movie! Highly recommend 🎬",
  "Trying out a new recipe tonight 👨‍🍳",
  "Beach day! Sun, sand, and good vibes 🏖️",
  "Nothing beats a home-cooked meal 🍽️",
  "Fresh flowers always brighten up the room 🌸",
  "Game night was epic! 🎮",
  "Sometimes you just need a good laugh 😂",
  "Early morning workout done! Feeling energized 💪",
  "Art museum visit today - so much inspiration 🎨",
  "Homemade cookies are the best kind of therapy 🍪",
  "New book arrived today! Can't wait to dive in 📘",
  "Coffee shop productivity mode activated ☕💼",
  "Nothing like a good conversation with old friends 👥",
  "Trying to master this new hobby 🎯",
  "Sunday funday with the family! 👨‍👩‍👧‍👦",
  "Technology is amazing but sometimes disconnecting feels great 📱❌",
  "i'm craving cookies 🍪",
];

const aiPosts = [
  "Experimenting with vector databases for semantic search. The recall is wild!",
  "RAG + fine-tuning isn't either/or. Start with retrieval, measure, then iterate.",
  "Anyone tried product quantization with IVF for billion-scale ANN?",
  "Structured outputs with function calling make LLMs feel like plugins.",
  "Thinking about chunking strategies: semantic vs fixed — what's working for you?",
  "Latency matters. Merging rerankers with approximate search is a fun tradeoff.",
];

const musicPosts = [
  "Been looping this chord progression all day 🎶",
  "Analog warmth hits different — dusted off the vinyls 🎧",
  "Anyone into odd time signatures? 7/8 is my current obsession.",
  "Dropped a new mix — ambient + lo-fi vibes.",
];

const foodPosts = [
  "Sourdough starter is finally alive — weekend bake incoming! 🍞",
  "Tried a new ramen spot. Umami bomb. 🍜",
  "Best cookie recipe? Crunchy edge, chewy center.",
];

const youtubeLinks = [
  "https://www.youtube.com/watch?v=8lo1s29ODj8",
  "https://www.youtube.com/watch?v=XFZ-rQ8eeR8",
  "https://www.youtube.com/watch?v=9gGnTQTYNaE",
  "https://www.youtube.com/watch?v=Beh13Cd_QbY",
  "https://www.youtube.com/watch?v=Ce1m3Y0OMKA",
];

// Predefined captions for each specific AI-related video
const youtubeCaptions = {
  "8lo1s29ODj8":
    "Solid discussion of decision making for Humans vs AI - worth checking out!",
  "XFZ-rQ8eeR8":
    "I had no idea these kinds of AI existed, especially self aware 😱.",
  "9gGnTQTYNaE":
    "Clear walkthrough of what Machine Learning is, for anyone interested.",
  Beh13Cd_QbY:
    "For anyone confused with all the new AI terminology, this helped me!",
  Ce1m3Y0OMKA:
    "Solid cover of the difference between Artificial Intelligence & Augmented Intelligence.",
};

const descriptions = [
  "Coffee enthusiast and adventure seeker",
  "Passionate about technology and innovation",
  "Love to travel and explore new cultures",
  "Creative soul with a passion for art",
  "Music lover and weekend warrior",
  "Foodie exploring the culinary world",
  "Bookworm and lifelong learner",
  "Fitness enthusiast and nature lover",
  "Developer by day, gamer by night",
  "Photography hobbyist and storyteller",
  "Entrepreneur building the future",
  "Teacher inspiring young minds",
  "Chef creating delicious experiences",
  "Designer crafting beautiful things",
  "Writer sharing stories and ideas",
  "AI tinkerer and vector DB enjoyer",
  "Bass player chasing tone",
  "Runner fueled by playlists",
];

let profilePics = [];
let maleAvatars = [];
let femaleAvatars = [];
let unknownAvatars = [];
async function ensureLocalAvatarsCopied() {
  try {
    const destDir = resolve(__dirname, "../public/images/avatars/ai_faces");

    // Ensure destination directory exists
    await fsp.mkdir(destDir, { recursive: true });

    // Prefer using already-present files in destDir (your current setup)
    let entries = [];
    try {
      entries = await fsp.readdir(destDir, { withFileTypes: true });
    } catch (e) {
      entries = [];
    }

    const imageNames = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => name.match(/\.(png|jpg|jpeg|webp|gif)$/i));

    const indexedUrls = [];
    const maleKeywords = /(male|man|boy|he|him|_m\b|\bm-|\bmale\b)/i;
    const femaleKeywords = /(female|woman|girl|she|her|_f\b|\bf-|\bfemale\b)/i;

    for (const name of imageNames) {
      const url = `/images/avatars/ai_faces/${name}`;
      indexedUrls.push(url);
      if (femaleKeywords.test(name)) femaleAvatars.push(url);
      else if (maleKeywords.test(name)) maleAvatars.push(url);
      else unknownAvatars.push(url);
    }

    if (indexedUrls.length > 0) {
      profilePics = indexedUrls;
    }

    // If one bucket is empty, borrow from unknown or the full set
    if (femaleAvatars.length === 0)
      femaleAvatars = unknownAvatars.length ? unknownAvatars : indexedUrls;
    if (maleAvatars.length === 0)
      maleAvatars = unknownAvatars.length ? unknownAvatars : indexedUrls;
  } catch (err) {
    console.warn("Avatar seeding: unable to index avatars:", err.message);
  }
}

// Helper functions
const getRandomItem = (array) =>
  array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomBoolean = () => Math.random() < 0.5;

const generateUsername = (firstName, lastName) => {
  const variations = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${getRandomNumber(10, 99)}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(
      10,
      99
    )}`,
  ];
  return getRandomItem(variations);
};

const createUsers = async (count = 50) => {
  console.log(`🎭 Creating ${count} users...`);
  const users = [];
  const usedUsernames = new Set();

  // Assign personas/topics
  const topics = [
    "ai",
    "music",
    "food",
    "family",
    "fitness",
    "travel",
    "art",
    "gaming",
    "photography",
  ];
  const topicWeights = {
    ai: 0.18,
    music: 0.14,
    food: 0.12,
    family: 0.12,
    fitness: 0.1,
    travel: 0.1,
    art: 0.08,
    gaming: 0.08,
    photography: 0.08,
  };
  const pickTopic = () => {
    const r = Math.random();
    let acc = 0;
    for (const t of topics) {
      acc += topicWeights[t];
      if (r <= acc) return t;
    }
    return getRandomItem(topics);
  };

  const metaByUsername = {};

  for (let i = 0; i < count; i++) {
    // Try to balance gender based on available avatars
    const preferFemale =
      femaleAvatars.length >= maleAvatars.length
        ? Math.random() < 0.55
        : Math.random() < 0.45;
    const gender = preferFemale ? "female" : "male";
    const firstName =
      gender === "female"
        ? getRandomItem(femaleFirstNames)
        : getRandomItem(maleFirstNames);
    const lastName = getRandomItem(lastNames);
    let username = generateUsername(firstName, lastName);

    // Ensure unique username
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = generateUsername(firstName, lastName) + counter;
      counter++;
    }
    usedUsernames.add(username);

    const hashedPassword = await hash("password123", 10);

    const topic = pickTopic();
    const picPool = gender === "female" ? femaleAvatars : maleAvatars;

    const user = {
      username,
      password: hashedPassword,
      openProfile: getRandomBoolean(),
      verified: Math.random() < 0.2, // 20% chance of being verified
      description: getRandomItem(descriptions),
      profilePic: picPool.length
        ? getRandomItem(picPool)
        : getRandomItem(profilePics),
    };

    users.push(user);
    metaByUsername[username] = { gender, topic };
  }

  const createdUsers = await User.bulkCreate(users);
  // Map id -> meta for later use
  const metaById = {};
  for (const u of createdUsers) {
    const meta = metaByUsername[u.username];
    if (meta) metaById[u.id] = meta;
  }

  console.log(`✅ Created ${createdUsers.length} users`);
  return { users: createdUsers, metas: metaById };
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateUniquePostForTopic(users, author, topic) {
  // Coherent, topic-aware templates
  const mentionChance = 0.15;

  const templates = {
    ai: [
      () =>
        `Reading about vector search trade-offs in IVF vs HNSW — notes to self for a prototype.`,
      () =>
        `Weekend project: wiring a small RAG pipeline and measuring retrieval quality before tuning.`,
      () =>
        `Finally got embeddings + ANN to behave. Next up: eval harness and reranking.`,
    ],
    music: [
      () =>
        `Spent the afternoon polishing a mix — compressors behaving today and the groove feels right.`,
      () => `Practicing a new chord progression and it’s starting to click.`,
      () => `Layering ambient textures; small changes, big mood.`,
    ],
    food: [
      () =>
        `Testing a new cookie recipe: crispy edges, chewy middle — dialing the bake time.`,
      () => `Ramen run: rich broth, perfect noodles. I could eat this daily.`,
      () => `Sourdough day — starter is lively, crumb looks promising.`,
    ],
    family: [
      () => `Family day at the park — frisbee, snacks, and a lot of laughs.`,
      () =>
        `Board games night with the kids — surprising upsets and good chaos.`,
      () => `Movie night in, blankets everywhere and endless popcorn.`,
    ],
    fitness: [
      () => `Early run done — steady pace, clear head.`,
      () => `Lifting session felt solid. Progress is slow and satisfying.`,
      () => `Stretching and mobility today — investing in future me.`,
    ],
    travel: [
      () => `Wandered into a quiet cafe while exploring a new neighborhood.`,
      () => `City walkabout: good light, good coffee, good notes.`,
      () => `Mapping out a weekend trip — leaning toward mountains.`,
    ],
    art: [
      () => `Sketchbook session: rough lines turning into something I like.`,
      () =>
        `Visited a small gallery — left with a head full of color palettes.`,
      () => `Trying a new brush set — texture experiments everywhere.`,
    ],
    gaming: [
      () => `Learning a new build and it’s starting to make sense.`,
      () => `Co-op session tonight — teamwork finally clicked on that boss.`,
      () => `Tuning keybinds and sensitivity — tiny tweaks, big difference.`,
    ],
    photography: [
      () =>
        `Golden hour did not disappoint — a few frames I can’t wait to edit.`,
      () => `Playing with backlight and silhouettes around the neighborhood.`,
      () => `Lightroom session — dialing contrast and color to taste.`,
    ],
  };

  const places = [
    "at the beach",
    "in the studio",
    "at a cafe",
    "on the train",
    "in the park",
    "from my desk",
    "in the kitchen",
  ];
  const closers = [
    "thoughts?",
    "tiny win.",
    "documenting this.",
    "happy with the progress.",
    "noted for next time.",
  ];
  const emojis = [
    "✨",
    "🔥",
    "🍪",
    "🎶",
    "💡",
    "⚡",
    "📈",
    "🧠",
    "🎧",
    "🍜",
    "🏖️",
    "☕",
    "📚",
    "🎮",
    "🎨",
  ];

  const base = getRandomItem(
    templates[topic] || templates.generic || templates.ai
  )();

  let sentence = base;

  // Optional natural mention
  if (users.length > 1 && Math.random() < mentionChance) {
    const mentionCandidates = users.filter((u) => u.id !== author.id);
    const mentioned = getRandomItem(mentionCandidates);
    const mentionPhrases = [
      `Just had a blast with @${mentioned.username} ${getRandomItem(places)}`,
      `Interesting idea that @${mentioned.username} shared with me`,
      `Great chat with @${mentioned.username} ${getRandomItem(places)}`,
    ];
    sentence = `${sentence} ${getRandomItem(mentionPhrases)}`;
  }

  if (Math.random() < 0.6) sentence = `${sentence} ${getRandomItem(places)}`;
  if (Math.random() < 0.9) sentence = `${sentence} ${getRandomItem(emojis)}`;

  return sentence;
}

const createPosts = async (users, metas, postsPerUser = { min: 1, max: 8 }) => {
  console.log("📝 Creating posts...");
  const posts = [];

  for (const user of users) {
    const numPosts = getRandomNumber(postsPerUser.min, postsPerUser.max);

    for (let i = 0; i < numPosts; i++) {
      const topic = metas[user.id]?.topic || "generic";
      const message = generateUniquePostForTopic(users, user, topic);

      // Decide wall owner (mostly self, sometimes others)
      let profileId = user.id;
      if (Math.random() < 0.2 && users.length > 1) {
        const otherUsers = users.filter((u) => u.id !== user.id);
        if (otherUsers.length > 0) {
          profileId = getRandomItem(otherUsers).id;
        }
      }

      posts.push({
        message,
        authorId: user.id,
        profileId,
        likes: 0,
        extraType: null,
        extraValue: null,
        createdAt: new Date(
          Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
        ),
      });
    }
  }

  const createdPosts = await Post.bulkCreate(posts);

  for (const post of createdPosts) {
    const embed = await LinkPreview.processMessageForEmbed(post.message);
    if (embed) {
      await post.update({
        extraType: embed.type,
        extraValue: JSON.stringify(embed),
      });
    }
  }

  console.log(
    `✅ Created ${createdPosts.length} posts (with embeds where applicable)`
  );
  return createdPosts;
};

const createLikes = async (users, posts) => {
  console.log("❤️ Creating likes...");
  let totalLikes = 0;

  for (const post of posts) {
    // Random number of users will like each post (0 to 70% of users)
    const maxLikes = Math.floor(users.length * 0.7);
    const numLikes = getRandomNumber(0, maxLikes);

    // Randomly select users to like this post
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const likingUsers = shuffledUsers.slice(0, numLikes);

    const validLikingUsers = [];
    for (const user of likingUsers) {
      // Avoid users liking their own posts (sometimes)
      if (user.id === post.authorId && Math.random() < 0.9) {
        continue;
      }
      validLikingUsers.push(user);
    }

    // Use Sequelize association to add likes
    if (validLikingUsers.length > 0) {
      const postInstance = await Post.findByPk(post.id);
      await postInstance.addLikedByUsers(validLikingUsers);

      // Update the post's like count
      await postInstance.update({ likes: validLikingUsers.length });
      totalLikes += validLikingUsers.length;
    }
  }

  console.log(`✅ Created ${totalLikes} likes`);
  return totalLikes;
};

const createComments = async (users, metas, posts) => {
  console.log("💬 Creating comments and threaded replies...");
  let totalComments = 0;

  const relatedTopics = {
    ai: ["ai", "gaming", "photography"],
    music: ["music", "art"],
    food: ["food", "family"],
    family: ["family", "food", "travel"],
    fitness: ["fitness", "travel"],
    travel: ["travel", "photography", "food"],
    art: ["art", "photography", "music"],
    gaming: ["gaming", "ai"],
    photography: ["photography", "travel", "art"],
  };

  for (const post of posts) {
    const topLevelCount = getRandomNumber(0, 4);
    const postOwnerTopic = metas[post.authorId]?.topic;
    const commentersPool = users.filter(
      (u) =>
        u.id !== post.authorId &&
        (!postOwnerTopic ||
          (relatedTopics[postOwnerTopic] || []).includes(metas[u.id]?.topic))
    );

    for (let i = 0; i < topLevelCount; i++) {
      const author = getRandomItem(
        commentersPool.length
          ? commentersPool
          : users.filter((u) => u.id !== post.authorId)
      );
      // Topic-aligned comment snippets
      const topic = metas[author.id]?.topic || postOwnerTopic || "generic";
      const topicSnippets = {
        ai: [
          "Curious how you measured recall.",
          "This makes the pipeline feel doable.",
          "Which embedding model did you use?",
        ],
        music: [
          "Love that groove.",
          "Mix sounds cleaner already.",
          "What headphones are you using?",
        ],
        food: [
          "Recipe please!",
          "That sounds delicious.",
          "Trying this next weekend.",
        ],
        family: [
          "Wholesome!",
          "Love days like this.",
          "Memories like these matter.",
        ],
        fitness: [
          "Nice pace!",
          "Recovery matters too.",
          "Form over weight, always.",
        ],
        travel: [
          "Adding this to my list.",
          "Sounds like a perfect day.",
          "Pics or it didn’t happen!",
        ],
        art: [
          "Great palette.",
          "Textures are looking good.",
          "Would love to see the final piece.",
        ],
        gaming: ["GG!", "That boss is tough.", "What build are you running?"],
        photography: ["Golden hour wins.", "Love that contrast.", "What lens?"],
        generic: ["Love this.", "Nice!", "Feels good."],
      };
      let msg = getRandomItem(topicSnippets[topic] || topicSnippets.generic);
      // Fewer mentions in comments
      if (Math.random() < 0.22) {
        const mentionTarget = getRandomItem(
          users.filter((u) => u.id !== author.id)
        );
        msg = `@${mentionTarget.username} ${msg}`;
      }

      const comment = await Comment.create({
        message: msg,
        postId: post.id,
        authorId: author.id,
        parentCommentId: null,
        likes: getRandomNumber(0, 5),
        createdAt: new Date(
          Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
        ),
      });
      totalComments++;

      // 0-2 replies for some comments
      const repliesCount = getRandomNumber(0, 2);
      for (let r = 0; r < repliesCount; r++) {
        const replierCandidates = users.filter(
          (u) => metas[u.id]?.topic === "ai"
        );
        const replier = getRandomItem(
          replierCandidates.length ? replierCandidates : users
        );
        let replyMsg = getRandomItem([...genericPosts, ...musicPosts]);
        if (Math.random() < 0.2) {
          replyMsg = `@${author.username || "user"} ${replyMsg}`;
        }
        await Comment.create({
          message: replyMsg,
          postId: post.id,
          authorId: replier.id,
          parentCommentId: comment.id,
          likes: getRandomNumber(0, 4),
          createdAt: new Date(
            Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
          ),
        });
        totalComments++;
      }
    }
  }

  console.log(`✅ Created ${totalComments} comments`);
  return totalComments;
};

async function createYouTubePostsWithReplies(users, metas) {
  console.log(
    "🎥 Creating one AI YouTube post per link with on-topic replies..."
  );

  // Choose distinct authors for each video
  const authors = [...users]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(youtubeLinks.length, users.length));
  const created = [];

  for (let i = 0; i < youtubeLinks.length && i < authors.length; i++) {
    const author = authors[i];
    const link = youtubeLinks[i];
    // Extract videoId
    const match = link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    const videoId = match ? match[1] : null;

    let caption = "Great AI video";
    if (videoId && youtubeCaptions[videoId]) caption = youtubeCaptions[videoId];

    let message = `${caption}\n${link}`;

    // Slight chance to add a single natural mention
    if (users.length > 1 && Math.random() < 0.12) {
      const mention = getRandomItem(users.filter((u) => u.id !== author.id));
      message += `\n(Shoutout to @${mention.username} for the recommendation!)`;
    }

    const post = await Post.create({
      message,
      authorId: author.id,
      profileId: author.id,
      likes: 0,
      extraType: null,
      extraValue: null,
      createdAt: new Date(
        Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
      ),
    });

    // Process embed
    const embed = await LinkPreview.processMessageForEmbed(post.message);
    if (embed) {
      await post.update({
        extraType: embed.type,
        extraValue: JSON.stringify(embed),
      });
    }

    // On-topic replies
    const replyTemplates = [
      "This explains the concept so clearly, I finally get it!",
      "Super interesting — I want to learn more about this pipeline.",
      "Great breakdown, makes complex stuff feel approachable.",
      "Saving this to try a hands-on build later.",
      "The visuals really helped the ideas click.",
      "Now I understand how embeddings + ANN fit together.",
    ];

    const topLevelCount = getRandomNumber(2, 5);
    for (let t = 0; t < topLevelCount; t++) {
      const commenterCandidates = users.filter(
        (u) => u.id !== author.id && metas[u.id]?.topic === "ai"
      );
      const commenter = getRandomItem(
        commenterCandidates.length
          ? commenterCandidates
          : users.filter((u) => u.id !== author.id)
      );
      let msg = getRandomItem(replyTemplates);
      if (Math.random() < 0.15) {
        const add = [
          "Thanks for sharing!",
          "Bookmarking this.",
          "Following along.",
          "Time to experiment with this.",
        ];
        msg += ` ${getRandomItem(add)}`;
      }
      const top = await Comment.create({
        message: msg,
        postId: post.id,
        authorId: commenter.id,
        parentCommentId: null,
        likes: getRandomNumber(0, 6),
        createdAt: new Date(
          Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
        ),
      });

      // 0-2 short agreement replies
      const replies = getRandomNumber(0, 2);
      for (let r = 0; r < replies; r++) {
        const replier = getRandomItem(users);
        const replyMsg = getRandomItem([
          "Same here — super clear.",
          "+1, this demystified a lot.",
          "Gonna try this weekend.",
          "Love the step-by-step approach.",
        ]);
        await Comment.create({
          message: replyMsg,
          postId: post.id,
          authorId: replier.id,
          parentCommentId: top.id,
          likes: getRandomNumber(0, 3),
          createdAt: new Date(
            Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
          ),
        });
      }
    }

    created.push(post);
  }

  console.log(
    `✅ Created ${created.length} YouTube AI posts with on-topic replies`
  );
  return created;
}

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Index avatars packaged with the app (server/public/images/avatars/ai_faces)
    await ensureLocalAvatarsCopied();
    if (!profilePics || profilePics.length === 0) {
      console.warn(
        "⚠️ No local avatars found in server/public/images/avatars/ai_faces. Users will get default avatars."
      );
    } else {
      console.log(`🖼️ Found ${profilePics.length} local avatar(s)`);
    }

    // Clear existing data
    console.log("🥹 Clearing existing data...");
    await sequelize.query('DELETE FROM "CommentLikes"');
    await sequelize.query('DELETE FROM "PostLikes"');
    await sequelize.query('DELETE FROM "Notifications"');
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test data
    const { users: createdUsers, metas } = await createUsers(50); // Create 50 users

    // Create exactly one post per provided AI YouTube link with tailored captions and replies
    const youtubePosts = await createYouTubePostsWithReplies(
      createdUsers,
      metas
    );

    // Create remaining generic/niche posts (without YouTube links)
    const otherPosts = await createPosts(createdUsers, metas, {
      min: 2,
      max: 6,
    });

    // Combine for likes; avoid adding generic comments to YouTube posts
    const allPosts = [...youtubePosts, ...otherPosts];
    await createLikes(createdUsers, allPosts); // Create likes across all posts

    // Only generate generic comments for non-YouTube posts to keep YouTube threads on-topic
    await createComments(createdUsers, metas, otherPosts);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Posts: ${youtubePosts.length + otherPosts.length}`);
    console.log(`   YouTube AI posts: ${youtubePosts.length}`);
    console.log(`   Other posts: ${otherPosts.length}`);
    console.log(`   Default password for all users: password123`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export default { seedDatabase };
