const { User, Post, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

// Sample data arrays
const firstNames = [
  "Alex",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Sophia",
  "William",
  "Isabella",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Mia",
  "Henry",
  "Harper",
  "Alexander",
  "Evelyn",
  "Mason",
  "Abigail",
  "Michael",
  "Emily",
  "Ethan",
  "Elizabeth",
  "Daniel",
  "Sofia",
  "Jacob",
  "Avery",
  "Logan",
  "Ella",
  "Jackson",
  "Scarlett",
  "Levi",
  "Grace",
  "Sebastian",
  "Chloe",
  "Mateo",
  "Victoria",
  "Jack",
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

const postMessages = [
  "Just had the most amazing coffee this morning! ☕",
  "Beautiful sunset today 🌅 Nature never fails to amaze me",
  "Working on some exciting new projects! 💼",
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
  "Exploring a new city today! So many discoveries 🗺️",
  "Music has the power to change your entire mood 🎵",
  "Late night coding session in progress 💻",
  "Fresh flowers always brighten up the room 🌸",
  "Game night was epic! 🎮",
  "Sometimes you just need a good laugh 😂",
  "Early morning workout done! Feeling energized 💪",
  "Art museum visit today - so much inspiration 🎨",
  "Homemade cookies are the best kind of therapy 🍪",
  "Stargazing tonight - the universe is incredible ⭐",
  "New book arrived today! Can't wait to dive in 📘",
  "Coffee shop productivity mode activated ☕💼",
  "Nothing like a good conversation with old friends 👥",
  "Trying to master this new hobby 🎯",
  "Sunday funday with the family! 👨‍👩‍👧‍👦",
  "Technology is amazing but sometimes disconnecting feels great 📱❌",
];

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
];

const profilePics = [
  "/images/avatars/default/avatar_default_0.png",
  "/images/avatars/default/avatar_default_1.png",
  "/images/avatars/default/avatar_default_2.png",
  "/images/avatars/default/avatar_default_3.png",
  "/images/avatars/default/avatar_default_4.png",
];

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

  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    let username = generateUsername(firstName, lastName);

    // Ensure unique username
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = generateUsername(firstName, lastName) + counter;
      counter++;
    }
    usedUsernames.add(username);

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = {
      username,
      password: hashedPassword,
      openProfile: getRandomBoolean(),
      verified: Math.random() < 0.2, // 20% chance of being verified
      description: getRandomItem(descriptions),
      profilePic: getRandomItem(profilePics),
    };

    users.push(user);
  }

  const createdUsers = await User.bulkCreate(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const createPosts = async (users, postsPerUser = { min: 1, max: 8 }) => {
  console.log("📝 Creating posts...");
  const posts = [];

  for (const user of users) {
    const numPosts = getRandomNumber(postsPerUser.min, postsPerUser.max);

    for (let i = 0; i < numPosts; i++) {
      // For most posts, post on your own wall (profileId = authorId)
      // But 20% of the time, post on someone else's wall
      let profileId = user.id; // Default: post on your own wall

      if (Math.random() < 0.2 && users.length > 1) {
        // 20% chance to post on someone else's wall
        const otherUsers = users.filter((u) => u.id !== user.id);
        if (otherUsers.length > 0) {
          profileId = getRandomItem(otherUsers).id;
        }
      }

      const post = {
        message: getRandomItem(postMessages),
        authorId: user.id,
        profileId: profileId,
        likes: 0, // Will be updated after creating likes
        extraType: null,
        extraValue: null,
        createdAt: new Date(
          Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)
        ), // Random date within last 30 days
      };
      posts.push(post);
    }
  }

  const createdPosts = await Post.bulkCreate(posts);
  console.log(`✅ Created ${createdPosts.length} posts`);
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

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🥹 Clearing existing data...");
    await sequelize.query('DELETE FROM "PostLikes"');
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Note: Auto-increment counters will reset automatically when tables are emptied

    // Create test data
    const users = await createUsers(50); // Create 50 users
    const posts = await createPosts(users, { min: 2, max: 6 }); // Each user creates 2-6 posts
    await createLikes(users, posts); // Create likes

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Default password for all users: password123`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
