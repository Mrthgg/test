import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3000;

// CORS headers middleware to allow Vercel/external static deployments to query the database
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Initialize JSON Database Path
const dbPath = path.resolve(process.cwd(), "vortex_store.json");

// Seed data definitions matching our standard fallbacks
const defaultCategories = [
  { id: 'cat-1', name: 'Ranks', order: 1 },
  { id: 'cat-2', name: 'Keys', order: 2 },
  { id: 'cat-3', name: 'Coins', order: 3 }
];

const defaultProducts = [
  { id: 'prod-1', name: 'VIP Rank', price: 500, description: 'Get a fancy VIP tag, special kits, and priority queue entrance!', category_id: 'cat-1', stock: -1, image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
  { id: 'prod-2', name: 'MVP Rank', price: 1000, description: 'Get all VIP perks plus /fly commands, custom particles, and extra chest slots!', category_id: 'cat-1', stock: -1, image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png' },
  { id: 'prod-3', name: 'Vortex Rank', price: 2500, description: 'The ULTIMATE rank. /fly, custom tag, monthly coins, exclusive discord access, and more!', category_id: 'cat-1', stock: 15, image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png' },
  { id: 'prod-4', name: 'Vortex Key', price: 100, description: 'Open the custom Vortex Crate at spawn for extremely rare loot and weapons!', category_id: 'cat-2', stock: -1, image_url: 'https://cdn-icons-png.flaticon.com/512/2889/2889312.png' },
  { id: 'prod-5', name: 'Mega Coins Package', price: 300, description: 'Get 50,000 server coins instantly credited to your in-game balance.', category_id: 'cat-3', stock: -1, image_url: 'https://cdn-icons-png.flaticon.com/512/272/272525.png' }
];

const defaultSettings = [
  {
    id: 'global',
    server_name: 'Eternity Hub',
    server_ip: 'play.eternityhub.fun',
    discord_link: 'https://discord.gg/eternity',
    server_icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png',
    primary_color: '#9333ea',
    secondary_color: '#22d3ee',
    brand_color_1: '#9333ea',
    brand_color_2: '#22d3ee',
    brand_name_split: 8,
    brand_name_first: 'Eternity',
    brand_name_second: 'Hub',
    hero_bg_url: '',
    patron_image_url: '',
    rules_bg_url: '',
    rules_border_color: '#9333ea',
    discord_order_webhook: '',
    mysql_host: 'lemon.nyctohost.com:3306',
    mysql_port: '3306',
    mysql_database: 's168_Two',
    mysql_user: 'u168_50U0Rj2EOa',
    mysql_password: 'm@gOsxCyU2.=DaCka@THfhcf',
    mysql_jdbc_string: 'jdbc:mysql://u168_50U0Rj2EOa:m@gOsxCyU2.=DaCka@THfhcf@lemon.nyctohost.com:3306/s168_Two'
  }
];

const defaultRules = [
  { id: 'rule-1', title: 'Fair Play', description: 'No hacking, cheating, or exploiting client modifications that give unfair advantages.', order: 1 },
  { id: 'rule-2', title: 'Respect Others', description: 'Keep chat clean and friendly. No toxic behavior, harassment, racism, or offensive slurs.', order: 2 },
  { id: 'rule-3', title: 'No Griefing / Stealing', description: 'Do not steal or destroy other players buildings, items, or claimed territories.', order: 3 },
  { id: 'rule-4', title: 'Lag Security', description: 'Do not build massive lag machines, infinite redstone loops, or mob farms designed to lag the tickrate.', order: 4 }
];

const defaultNews = [
  { id: 'news-1', title: 'Season 4 Launch!', content: 'Welcome to Season 4 of Eternity Hub! We have reset the map with a beautiful new seed, custom structures, a revamped store, and massive gameplay updates! Log on now to claim your free welcome kit.', author: 'Owner', created_at: new Date().toISOString() },
  { id: 'news-2', title: 'Staff Application Open', content: 'We are looking for motivated helpers to join our team! Head over to discord to submit an application if you have experience with moderation.', author: 'Moderator Manager', created_at: new Date().toISOString() }
];

const defaultVoteLinks = [
  { id: 'v-1', name: 'Planet Minecraft (Vote 1)', url: 'https://www.planetminecraft.com' },
  { id: 'v-2', name: 'MinecraftServers.org (Vote 2)', url: 'https://minecraftservers.org' }
];

const defaultRanks = [
  { id: 'r-1', name: 'Owner', order: 1 },
  { id: 'r-2', name: 'Admin', order: 2 },
  { id: 'r-3', name: 'Developer', order: 3 },
  { id: 'r-4', name: 'Moderator', order: 4 },
  { id: 'r-5', name: 'Helper', order: 5 }
];

const defaultStaff = [
  { id: 's-1', ign: 'knightsoul14323', rank_id: 'r-1' },
  { id: 's-2', ign: 'EternityManager', rank_id: 'r-2' },
  { id: 's-3', ign: 'CodeNinja', rank_id: 'r-3' }
];

const defaultPurchases = [
  { id: 'p-1', username: 'knightsoul14323', rank_name: 'Vortex Rank', amount_paid: 2500, purchase_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), sender_number: '01711112222', trx_id: 'TRX_VORTEX1', status: 'approved' },
  { id: 'p-2', username: 'steve', rank_name: 'VIP Rank', amount_paid: 500, purchase_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), sender_number: '01833334444', trx_id: 'TRX_STEVE2', status: 'approved' },
  { id: 'p-3', username: 'alex', rank_name: 'MVP Rank', amount_paid: 1000, purchase_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), sender_number: '01955556666', trx_id: 'TRX_ALEX3', status: 'approved' },
  { id: 'p-4', username: 'dream', rank_name: 'Vortex Rank', amount_paid: 2500, purchase_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), sender_number: '01577778888', trx_id: 'TRX_DREAM4', status: 'approved' },
  { id: 'p-5', username: 'notorious', rank_name: 'MVP Rank', amount_paid: 1000, purchase_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), sender_number: '01699990000', trx_id: 'TRX_NOTORIOUS5', status: 'approved' },
  { id: 'p-pending-1', username: 'herobrine', rank_name: 'Vortex Rank', amount_paid: 2500, purchase_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(), sender_number: '01799998888', trx_id: 'TRX_PENDING123', status: 'pending' },
  { id: 'p-pending-2', username: 'dinnerbone', rank_name: 'VIP Rank', amount_paid: 500, purchase_date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), sender_number: '01888887777', trx_id: 'TRX_PENDING567', status: 'pending' }
];

const defaultOrders = [
  { id: 'o-1', user_id: 'guest', ign: 'knightsoul14323', payment_method: 'bkash', sender_number: '01712345678', transaction_id: 'TRX_VORTEX1', status: 'verified', total_amount: 2500, items: [{ productId: 'prod-3', name: 'Vortex Rank', price: 2500, quantity: 1 }], created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'o-2', user_id: 'guest', ign: 'steve', payment_method: 'nagad', sender_number: '01812345678', transaction_id: 'TRX_STEVE2', status: 'verified', total_amount: 500, items: [{ productId: 'prod-1', name: 'VIP Rank', price: 500, quantity: 1 }], created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'o-3', user_id: 'guest', ign: 'alex', payment_method: 'rocket', sender_number: '01912345678', transaction_id: 'TRX_ALEX3', status: 'verified', total_amount: 1000, items: [{ productId: 'prod-2', name: 'MVP Rank', price: 1000, quantity: 1 }], created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'o-4', user_id: 'guest', ign: 'dream', payment_method: 'bkash', sender_number: '01512345678', transaction_id: 'TRX_DREAM4', status: 'pending', total_amount: 2500, items: [{ productId: 'prod-3', name: 'Vortex Rank', price: 2500, quantity: 1 }], created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const defaultUsers = [
  {
    id: 'usr_admin_1',
    email: 'knightsoul14323@gmail.com',
    password: 'adminmc',
    display_name: 'KnightSoul'
  }
];

const defaultProfiles = [
  {
    id: 'usr_admin_1',
    email: 'knightsoul14323@gmail.com',
    display_name: 'KnightSoul',
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

const defaultAdminEmails = [
  { id: 'ae_1', email: 'knightsoul14323@gmail.com', created_at: new Date().toISOString() }
];

function initializeDatabase() {
  try {
    let dbData: any = {};
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      } catch {
        dbData = {};
      }
    } else {
      fs.writeFileSync(dbPath, JSON.stringify({}), "utf-8");
    }

    const seedIfMissing = (key: string, defaultValue: any) => {
      if (dbData[key] === undefined) {
        dbData[key] = defaultValue;
        console.log(`Seeded default data for collection: ${key}`);
      }
    };

    seedIfMissing("categories", defaultCategories);
    seedIfMissing("products", defaultProducts);
    seedIfMissing("settings", defaultSettings);

    // Populate or update global settings with MySQL configuration if blank
    if (Array.isArray(dbData.settings)) {
      const globalSettingIndex = dbData.settings.findIndex((s: any) => s.id === 'global');
      if (globalSettingIndex !== -1) {
        const gs = dbData.settings[globalSettingIndex];
        if (!gs.mysql_host || !gs.mysql_database || !gs.mysql_user) {
          dbData.settings[globalSettingIndex] = {
            ...gs,
            mysql_host: 'lemon.nyctohost.com:3306',
            mysql_port: '3306',
            mysql_database: 's168_Two',
            mysql_user: 'u168_50U0Rj2EOa',
            mysql_password: 'm@gOsxCyU2.=DaCka@THfhcf',
            mysql_jdbc_string: 'jdbc:mysql://u168_50U0Rj2EOa:m@gOsxCyU2.=DaCka@THfhcf@lemon.nyctohost.com:3306/s168_Two'
          };
          console.log("Updated global MySQL settings in vortex_store.json");
        }
      }
    }
    seedIfMissing("rules", defaultRules);
    seedIfMissing("news", defaultNews);
    seedIfMissing("vote_links", defaultVoteLinks);
    seedIfMissing("ranks", defaultRanks);
    seedIfMissing("staff", defaultStaff);
    seedIfMissing("purchases", defaultPurchases);
    seedIfMissing("orders", defaultOrders);
    seedIfMissing("local_users", defaultUsers);
    seedIfMissing("local_profiles", defaultProfiles);
    seedIfMissing("admin_emails", defaultAdminEmails);

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
    console.log("JSON vortex_store.json database successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize JSON database:", err);
  }
}

// Call on startup
initializeDatabase();

// Helpers for read/write on the JSON Store
function getCollection(key: string): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      if (!fs.existsSync(dbPath)) {
        initializeDatabase();
      }
      const raw = fs.readFileSync(dbPath, "utf-8");
      const dbData = JSON.parse(raw);
      if (dbData[key] !== undefined) {
        resolve(dbData[key]);
      } else {
        // Fallback to defaults
        switch (key) {
          case 'categories': resolve(defaultCategories); break;
          case 'products': resolve(defaultProducts); break;
          case 'settings': resolve(defaultSettings); break;
          case 'rules': resolve(defaultRules); break;
          case 'news': resolve(defaultNews); break;
          case 'vote_links': resolve(defaultVoteLinks); break;
          case 'ranks': resolve(defaultRanks); break;
          case 'staff': resolve(defaultStaff); break;
          case 'purchases': resolve(defaultPurchases); break;
          case 'orders': resolve(defaultOrders); break;
          case 'local_users': resolve(defaultUsers); break;
          case 'local_profiles': resolve(defaultProfiles); break;
          case 'admin_emails': resolve(defaultAdminEmails); break;
          default: resolve([]);
        }
      }
    } catch (err) {
      console.error("Error reading JSON database:", err);
      resolve([]);
    }
  });
}

function saveCollection(key: string, data: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(dbPath)) {
        initializeDatabase();
      }
      const raw = fs.readFileSync(dbPath, "utf-8");
      const dbData = JSON.parse(raw);
      dbData[key] = data;
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
      resolve();
    } catch (err) {
      console.error("Error writing JSON database:", err);
      reject(err);
    }
  });
}

// --- DB Query Proxy Endpoints ---
app.post("/api/db/query", async (req, res) => {
  const { table, operation, opValues, filters, isSingle, sortCol, sortAscending, limitNum } = req.body;

  try {
    let data = await getCollection(table);

    // Evaluate filters
    const filterFn = (item: any) => {
      if (!filters || filters.length === 0) return true;
      return filters.every((f: any) => {
        const itemVal = item[f.col];
        if (f.type === 'eq') {
          if (f.val === null || f.val === undefined) {
            return itemVal === null || itemVal === undefined;
          }
          return String(itemVal).toLowerCase() === String(f.val).toLowerCase();
        }
        if (f.type === 'neq') {
          if (f.val === null || f.val === undefined) {
            return itemVal !== null && itemVal !== undefined;
          }
          return String(itemVal).toLowerCase() !== String(f.val).toLowerCase();
        }
        if (f.type === 'ilike') {
          const search = String(f.val || '').replace(/%/g, '').toLowerCase();
          return String(itemVal || '').toLowerCase().includes(search);
        }
        if (f.type === 'gte') {
          if (itemVal === undefined || itemVal === null) return false;
          return itemVal >= f.val;
        }
        if (f.type === 'lte') {
          if (itemVal === undefined || itemVal === null) return false;
          return itemVal <= f.val;
        }
        if (f.type === 'gt') {
          if (itemVal === undefined || itemVal === null) return false;
          return itemVal > f.val;
        }
        if (f.type === 'lt') {
          if (itemVal === undefined || itemVal === null) return false;
          return itemVal < f.val;
        }
        if (f.type === 'in') {
          return Array.isArray(f.val) && f.val.includes(itemVal);
        }
        return true;
      });
    };

    if (operation === 'insert') {
      const entries = Array.isArray(opValues) ? opValues : [opValues];
      const newEntries = entries.map((e: any) => ({
        id: e.id || 'id_' + Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        ...e
      }));
      data.push(...newEntries);
      await saveCollection(table, data);

      // Handle backend side-effect: adding to authorized admin roster
      if (table === 'admin_emails') {
        const email = entries[0]?.email;
        if (email) {
          const lowercaseEmail = email.toLowerCase();
          
          // Ensure role is admin on profiles
          const profiles = await getCollection('local_profiles');
          let profileFound = false;
          profiles.forEach((p: any) => {
            if (p.email.toLowerCase() === lowercaseEmail) {
              p.role = 'admin';
              profileFound = true;
            }
          });
          await saveCollection('local_profiles', profiles);

          // Add to local users list with the default password "adminmc" if not existing
          const users = await getCollection('local_users');
          let targetUserId = '';
          const existingUser = users.find((u: any) => u.email.toLowerCase() === lowercaseEmail);
          
          if (!existingUser) {
            const newUserId = 'usr_' + Math.random().toString(36).substring(2, 11);
            const newUser = {
              id: newUserId,
              email: lowercaseEmail,
              password: 'adminmc',
              display_name: lowercaseEmail.split('@')[0]
            };
            users.push(newUser);
            await saveCollection('local_users', users);
            targetUserId = newUserId;
          } else {
            targetUserId = existingUser.id;
          }

          if (!profileFound) {
            profiles.push({
              id: targetUserId,
              email: lowercaseEmail,
              display_name: lowercaseEmail.split('@')[0],
              role: 'admin',
              created_at: new Date().toISOString()
            });
            await saveCollection('local_profiles', profiles);
          }
        }
      }

      return res.json({ data: newEntries, error: null });
    }

    if (operation === 'update') {
      let updatedCount = 0;
      data.forEach((item: any) => {
        if (filterFn(item)) {
          Object.assign(item, opValues);
          updatedCount++;
        }
      });
      await saveCollection(table, data);
      return res.json({ data: opValues, error: null, count: updatedCount });
    }

    if (operation === 'upsert') {
      const entries = Array.isArray(opValues) ? opValues : [opValues];
      entries.forEach((e: any) => {
        const idx = data.findIndex((item: any) => item.id === e.id);
        if (idx !== -1) {
          Object.assign(data[idx], e);
        } else {
          data.push({
            id: e.id || 'id_' + Math.random().toString(36).substring(2, 11),
            created_at: new Date().toISOString(),
            ...e
          });
        }
      });
      await saveCollection(table, data);
      return res.json({ data: opValues, error: null });
    }

    if (operation === 'delete') {
      let deletedCount = 0;
      const filtered = data.filter((item: any) => {
        const matches = filterFn(item);
        if (matches) {
          deletedCount++;
          if (table === 'admin_emails') {
            const email = item.email;
            getCollection('local_profiles').then(async (profiles) => {
              profiles.forEach((p: any) => {
                if (p.email.toLowerCase() === email.toLowerCase()) {
                  p.role = 'user';
                }
              });
              await saveCollection('local_profiles', profiles);
            });
          }
        }
        return !matches;
      });
      await saveCollection(table, filtered);
      return res.json({ data: null, error: null, count: deletedCount });
    }

    // Default select/fetch operation
    let resultSet = data.filter(filterFn);

    if (sortCol) {
      resultSet.sort((a: any, b: any) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAscending ? valA - valB : valB - valA;
        }
        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        if (strA < strB) return sortAscending ? -1 : 1;
        if (strA > strB) return sortAscending ? 1 : -1;
        return 0;
      });
    }

    if (limitNum !== null && limitNum !== undefined) {
      resultSet = resultSet.slice(0, limitNum);
    }

    if (isSingle) {
      resultSet = resultSet.length > 0 ? resultSet[0] : null;
    }

    return res.json({ data: resultSet, error: null });

  } catch (err: any) {
    console.error("DB query execution error on server:", err);
    return res.status(500).json({ data: null, error: err.message || "Query Execution Error" });
  }
});

// Auth Helper APIs
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, display_name } = req.body;
  try {
    const users = await getCollection('local_users');
    const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    let user;
    if (existing) {
      if (existing.password === 'adminmc') {
        existing.password = password;
        if (display_name) existing.display_name = display_name;
        await saveCollection('local_users', users);
        user = existing;
      } else {
        return res.status(400).json({ error: { message: 'User already exists' } });
      }
    } else {
      const displayName = display_name || email.split('@')[0];
      const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        email,
        password,
        display_name: displayName
      };
      users.push(newUser);
      await saveCollection('local_users', users);
      user = newUser;
    }

    // Ensure profiles contains the user profile with correct role
    const profiles = await getCollection('local_profiles');
    const adminEmails = await getCollection('admin_emails');
    const isAdmin = email.toLowerCase() === 'knightsoul14323@gmail.com' ||
                    adminEmails.some((a: any) => a.email.toLowerCase() === email.toLowerCase());

    const profileIdx = profiles.findIndex((p: any) => p.email.toLowerCase() === email.toLowerCase());
    if (profileIdx !== -1) {
      profiles[profileIdx].role = isAdmin ? 'admin' : 'user';
      if (display_name) profiles[profileIdx].display_name = display_name;
    } else {
      profiles.push({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: isAdmin ? 'admin' : 'user',
        created_at: new Date().toISOString()
      });
    }
    await saveCollection('local_profiles', profiles);

    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: { message: err.message || 'Signup failed' } });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const lowercaseEmail = email.toLowerCase();
    const users = await getCollection('local_users');
    const adminEmails = await getCollection('admin_emails');
    const isAdminEmail = lowercaseEmail === 'knightsoul14323@gmail.com' ||
                         adminEmails.some((a: any) => a.email.toLowerCase() === lowercaseEmail);

    let user = users.find((u: any) => u.email.toLowerCase() === lowercaseEmail);

    if (isAdminEmail) {
      if (!user) {
        // Automatically create account for added admin email on first login attempt!
        const newUserId = 'usr_' + Math.random().toString(36).substring(2, 11);
        user = {
          id: newUserId,
          email: lowercaseEmail,
          password: password,
          display_name: lowercaseEmail.split('@')[0]
        };
        users.push(user);
        await saveCollection('local_users', users);

        const profiles = await getCollection('local_profiles');
        const profileIdx = profiles.findIndex((p: any) => p.email.toLowerCase() === lowercaseEmail);
        if (profileIdx !== -1) {
          profiles[profileIdx].role = 'admin';
        } else {
          profiles.push({
            id: newUserId,
            email: lowercaseEmail,
            display_name: lowercaseEmail.split('@')[0],
            role: 'admin',
            created_at: new Date().toISOString()
          });
        }
        await saveCollection('local_profiles', profiles);
      } else if (user.password === 'adminmc') {
        // Upgrade temporary placeholder password 'adminmc' to the one they just logged in with!
        user.password = password;
        await saveCollection('local_users', users);
      }
    }

    if (!user || user.password !== password) {
      return res.status(400).json({ error: { message: 'Invalid admin login credentials. Double-check your details.' } });
    }
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/auth/update_user", async (req, res) => {
  const { userId, password, display_name } = req.body;
  try {
    const users = await getCollection('local_users');
    const userIdx = users.findIndex((u: any) => u.id === userId);
    if (userIdx !== -1) {
      if (password) users[userIdx].password = password;
      if (display_name) users[userIdx].display_name = display_name;
      await saveCollection('local_users', users);
    }

    const profiles = await getCollection('local_profiles');
    const profileIdx = profiles.findIndex((p: any) => p.id === userId);
    if (profileIdx !== -1) {
      if (display_name) profiles[profileIdx].display_name = display_name;
      await saveCollection('local_profiles', profiles);
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: { message: err.message } });
  }
});

// Server-side Password Reset In-Memory Tokens
const resetTokens = new Map<string, { token: string; expires: number; email: string }>();

app.post("/api/auth/forgot-password", async (req, res) => {
  const { username, email } = req.body;
  try {
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanEmail = String(email || '').trim().toLowerCase();
    
    if (!cleanUsername || !cleanEmail) {
      return res.status(400).json({ error: "Missing username or email" });
    }

    const users = await getCollection('local_users');
    const user = users.find((u: any) => 
      u.email.toLowerCase() === cleanUsername || 
      u.display_name.toLowerCase() === cleanUsername ||
      u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      return res.status(404).json({ error: `User with username/email "${cleanUsername}" is not registered.` });
    }

    // Generate 6-digit code
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(user.email.toLowerCase(), {
      token: simulatedCode,
      expires: Date.now() + 15 * 60 * 1000,
      email: cleanEmail
    });

    console.log(`[PASSWORD RESET CODE] User: ${user.email}, Code: ${simulatedCode}`);

    return res.json({ 
      message: `A verification reset PIN code has been generated. Code is printed in server console: ${simulatedCode}` 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate forgot power token" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { username, token, newPassword } = req.body;
  try {
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanToken = String(token || '').trim();

    if (!cleanUsername || !cleanToken || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const users = await getCollection('local_users');
    const user = users.find((u: any) => 
      u.email.toLowerCase() === cleanUsername || 
      u.display_name.toLowerCase() === cleanUsername
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const storedReset = resetTokens.get(user.email.toLowerCase());
    if (!storedReset || storedReset.token !== cleanToken || Date.now() > storedReset.expires) {
      return res.status(400).json({ error: "Invalid or expired verification PIN" });
    }

    // Update password
    user.password = newPassword;
    await saveCollection('local_users', users);

    // Clean up used token
    resetTokens.delete(user.email.toLowerCase());

    console.log(`[PASSWORD RESET SUCCESS] User: ${user.email} updated password successfully.`);
    return res.json({ success: true, message: "Password updated successfully!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to reset password" });
  }
});

// --- MySQL & ajLeaderboards Endpoints (Secure Configuration Object Architecture) ---
app.post("/api/mysql-test", async (req, res) => {
  const { host, port, database, user, password } = req.body;

  if (!host || !database || !user) {
    return res.status(400).json({ success: false, error: "Missing required MySQL configuration properties (host, database, user)." });
  }

  const [hostname, defaultPort] = host.includes(':') ? host.split(':') : [host, port || '3306'];

  try {
    const connection = await mysql.createConnection({
      host: hostname,
      port: Number(defaultPort || 3306),
      database,
      user,
      password: password || '',
      connectTimeout: 5000
    });

    await connection.execute("SELECT 1");
    const [tablesRes] = await connection.execute("SHOW TABLES");
    await connection.end();

    const tables = (tablesRes as any[]).map(row => Object.values(row)[0]);
    const tableSummary = tables.length > 0 ? ` Tables found: ${tables.slice(0, 10).join(', ')}${tables.length > 10 ? '...' : ''}` : ' (No tables found in database)';

    return res.json({ success: true, message: `Successfully connected to MySQL database (${database} @ ${hostname}:${defaultPort})!${tableSummary}` });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "Failed to connect to MySQL database. Check credentials." });
  }
});

app.get("/db-check", async (req, res) => {
  try {
    const settingsColl = await getCollection('settings');
    const globalSettings = settingsColl.find((s: any) => s.id === 'global') || {};
    
    const host = globalSettings.mysql_host || process.env.MYSQL_HOST;
    const port = globalSettings.mysql_port || process.env.MYSQL_PORT || '3306';
    const database = globalSettings.mysql_database || process.env.MYSQL_DATABASE;
    const user = globalSettings.mysql_user || process.env.MYSQL_USER;
    const password = globalSettings.mysql_password || process.env.MYSQL_PASSWORD;

    if (!host || !database || !user) {
      return res.send(`
        <html>
          <head><title>Database Inspection</title><script src="https://cdn.tailwindcss.com"></script></head>
          <body class="bg-slate-950 text-white p-8 font-sans">
            <div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <h1 class="text-2xl font-bold text-red-400 mb-2">MySQL Not Configured</h1>
              <p class="text-slate-400 mb-4">Please configure your MySQL database credentials in the Admin Panel Settings first.</p>
              <a href="/admin/settings" class="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm">Go to Admin Settings</a>
            </div>
          </body>
        </html>
      `);
    }

    const [hostname, defaultPort] = host.includes(':') ? host.split(':') : [host, port || '3306'];
    const connection = await mysql.createConnection({
      host: hostname,
      port: Number(defaultPort || 3306),
      database,
      user,
      password: password || '',
      connectTimeout: 5000
    });

    const [tablesRes] = await connection.execute("SHOW TABLES");
    const tables = (tablesRes as any[]).map(row => Object.values(row)[0] as string);

    let killsRows: any[] = [];
    let killsColumns: string[] = [];
    const targetTable = tables.find(t => t.toLowerCase() === 'ajlb_statistic_player_kills' || t.toLowerCase().includes('kills'));
    const hasExtras = tables.some(t => t.toLowerCase() === 'ajlb_extras');

    if (targetTable) {
      if (hasExtras) {
        try {
          const [joinedRows] = await connection.execute(`SELECT e.name, s.value, s.id FROM \`${targetTable}\` s INNER JOIN ajlb_extras e ON s.id = e.id ORDER BY s.value DESC LIMIT 10`);
          killsRows = joinedRows as any[];
        } catch {
          try {
            const [joinedRows2] = await connection.execute(`SELECT e.namecache AS name, s.value, s.id FROM \`${targetTable}\` s INNER JOIN ajlb_extras e ON s.id = e.id ORDER BY s.value DESC LIMIT 10`);
            killsRows = joinedRows2 as any[];
          } catch {
            const [rows] = await connection.execute(`SELECT * FROM \`${targetTable}\` LIMIT 10`);
            killsRows = rows as any[];
          }
        }
      } else {
        const [rows] = await connection.execute(`SELECT * FROM \`${targetTable}\` LIMIT 10`);
        killsRows = rows as any[];
      }

      if (killsRows.length > 0) {
        killsColumns = Object.keys(killsRows[0]);
      }
    }

    await connection.end();

    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Database Inspector - ajLeaderboards</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen p-6 md:p-12 font-sans">
          <div class="max-w-5xl mx-auto space-y-8">
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h1 class="text-2xl font-black text-white flex items-center space-x-3">
                    <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Database Diagnostic & Inspector</span>
                  </h1>
                  <p class="text-xs text-slate-400 mt-1">Connected to <span class="text-cyan-400 font-mono">${database}</span> at <span class="text-purple-400 font-mono">${hostname}:${defaultPort}</span> as <span class="text-amber-400 font-mono">${user}</span></p>
                </div>
                <a href="/admin/settings" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">Back to Admin</a>
              </div>

              <div class="space-y-4">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Tables Found (${tables.length})</h2>
                <div class="flex flex-wrap gap-2">
                  ${tables.length > 0 ? tables.map(t => `<span class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs ${t.toLowerCase().includes('kills') ? 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20 font-bold' : 'text-slate-300'}">${t}</span>`).join('') : '<p class="text-xs text-slate-500 italic">No tables found in this database.</p>'}
                </div>
              </div>
            </div>

            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-white">Table Data: <span class="text-cyan-400 font-mono">${targetTable || 'ajlb_statistic_player_kills (Not Found)'}</span></h2>
                  <p class="text-xs text-slate-400">Showing up to first 10 rows from the database table.</p>
                </div>
                ${targetTable ? `<span class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-bold">${killsRows.length} rows loaded</span>` : '<span class="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full font-bold">Table not created yet</span>'}
              </div>

              ${targetTable && killsRows.length > 0 ? `
                <div class="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
                        ${killsColumns.map(col => `<th class="p-3.5 font-bold uppercase tracking-wider">${col}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 font-mono text-slate-300">
                      ${killsRows.map(row => `
                        <tr class="hover:bg-slate-800/40 transition-colors">
                          ${killsColumns.map(col => `<td class="p-3.5">${row[col] !== null && row[col] !== undefined ? row[col] : '<span class="text-slate-600">NULL</span>'}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <div class="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <p class="text-sm font-bold text-white">No data records found or table does not exist.</p>
                  <p class="text-xs text-slate-500">Ensure your Minecraft server has ajLeaderboards installed, players have generated statistics, and the database has been synced.</p>
                </div>
              `}
            </div>
          </div>
        </body>
      </html>
    `;
    return res.send(html);
  } catch (err: any) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Connection Error</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-slate-950 text-white p-8 font-sans">
          <div class="max-w-2xl mx-auto bg-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <h1 class="text-2xl font-bold text-red-400">Database Connection Failed</h1>
            <p class="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">${err.message || 'Unknown error'}</p>
            <a href="/admin/settings" class="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm">Return to Admin Settings</a>
          </div>
        </body>
      </html>
    `);
  }
});

app.get("/api/leaderboard/:metric", async (req, res) => {
  const { metric } = req.params;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  try {
    const settingsColl = await getCollection('settings');
    const globalSettings = settingsColl.find((s: any) => s.id === 'global') || {};
    
    const host = globalSettings.mysql_host || process.env.MYSQL_HOST;
    const port = globalSettings.mysql_port || process.env.MYSQL_PORT || '3306';
    const database = globalSettings.mysql_database || process.env.MYSQL_DATABASE;
    const user = globalSettings.mysql_user || process.env.MYSQL_USER;
    const password = globalSettings.mysql_password || process.env.MYSQL_PASSWORD;

    let mysqlData: any[] = [];
    let connected = false;

    if (host && database && user) {
      try {
        const [hostname, defaultPort] = host.includes(':') ? host.split(':') : [host, port || '3306'];
        const connection = await mysql.createConnection({
          host: hostname,
          port: Number(defaultPort || 3306),
          database,
          user,
          password: password || '',
          connectTimeout: 4000
        });

        // 1. Inspect existing tables in database
        const [tablesRes] = await connection.execute("SHOW TABLES");
        const tables = (tablesRes as any[]).map(row => Object.values(row)[0] as string);

        // 2. Find matching table for requested metric
        let matchedTable: string | undefined;
        if (metric === 'playtime') {
          matchedTable = tables.find(t => t.includes('hours') || t.includes('playtime') || t.includes('time'));
        } else if (metric === 'kills') {
          matchedTable = tables.find(t => t.includes('kills'));
        } else if (metric === 'balance') {
          matchedTable = tables.find(t => t.includes('balance') || t.includes('money') || t.includes('eco'));
        } else if (metric === 'deaths') {
          matchedTable = tables.find(t => t.includes('deaths'));
        } else {
          matchedTable = tables.find(t => t.toLowerCase().includes(metric.toLowerCase()));
        }

        if (matchedTable) {
          const [rows] = await connection.execute(
            `SELECT COALESCE(NULLIF(namecache, ''), NULLIF(displaynamecache, ''), id) AS username, CAST(value AS DECIMAL(20,2)) AS value FROM \`${matchedTable}\` ORDER BY CAST(value AS DECIMAL(20,2)) DESC LIMIT ?`,
            [limit]
          );
          const rList = rows as any[];
          if (rList && rList.length > 0) {
            mysqlData = rList.map((r: any, idx: number) => ({
              rank: idx + 1,
              username: r.username || `Player${idx + 1}`,
              value: Number(r.value || 0)
            }));
            connected = true;
          }
        }

        await connection.end();
      } catch (err) {
        console.log("MySQL ajLeaderboards query failed:", err);
      }
    }

    return res.json({ metric, data: mysqlData, connected });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch leaderboard" });
  }
});

// Player Profile API Endpoint
app.get("/api/player/:username", async (req, res) => {
  const { username } = req.params;
  const cleanUsername = String(username || '').trim();

  if (!cleanUsername) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const staffList = await getCollection('staff');
    const ranksList = await getCollection('ranks');
    const purchasesList = await getCollection('purchases');
    const ordersList = await getCollection('orders');
    const profilesList = await getCollection('local_profiles');

    // 1. Check if staff member
    const staffMember = staffList.find((s: any) => 
      (s.ign && s.ign.toLowerCase() === cleanUsername.toLowerCase()) || 
      (s.username && s.username.toLowerCase() === cleanUsername.toLowerCase())
    );

    let staffRankName = null;
    if (staffMember) {
      const rankObj = ranksList.find((r: any) => r.id === staffMember.rank_id);
      staffRankName = rankObj ? rankObj.name : 'Staff';
    }

    // 2. Fetch purchases & orders matching username / IGN
    const userPurchases = purchasesList.filter((p: any) => 
      p.username && p.username.toLowerCase() === cleanUsername.toLowerCase() && p.status === 'approved'
    );

    const userOrders = ordersList.filter((o: any) => 
      o.ign && o.ign.toLowerCase() === cleanUsername.toLowerCase() && o.status === 'verified'
    );

    // Calculate total spent
    const totalSpentPurchases = userPurchases.reduce((acc: number, item: any) => acc + (Number(item.amount_paid) || 0), 0);
    const totalSpentOrders = userOrders.reduce((acc: number, item: any) => acc + (Number(item.total_amount) || 0), 0);
    const totalSpent = Math.max(totalSpentPurchases, totalSpentOrders);

    // Primary store rank badge if purchased
    let storeRankBadge = null;
    const highestRankPurchase = userPurchases.find((p: any) => p.rank_name && p.rank_name.toLowerCase().includes('rank'));
    if (highestRankPurchase) {
      storeRankBadge = highestRankPurchase.rank_name;
    } else if (userOrders.length > 0) {
      const rankItem = userOrders.flatMap((o: any) => o.items || []).find((i: any) => i.name && i.name.toLowerCase().includes('rank'));
      if (rankItem) storeRankBadge = rankItem.name;
    }

    // Check account profile
    const userProfile = profilesList.find((p: any) => 
      p.display_name && p.display_name.toLowerCase() === cleanUsername.toLowerCase()
    );

    // 3. Attempt to fetch stats from MySQL ajLeaderboards
    let stats = {
      playtime: 0,
      kills: 0,
      balance: 0,
      deaths: 0,
      votes: Math.floor(Math.random() * 15) + 1
    };

    const settingsColl = await getCollection('settings');
    const globalSettings = settingsColl.find((s: any) => s.id === 'global') || {};
    const host = globalSettings.mysql_host || process.env.MYSQL_HOST;
    const database = globalSettings.mysql_database || process.env.MYSQL_DATABASE;
    const user = globalSettings.mysql_user || process.env.MYSQL_USER;
    const password = globalSettings.mysql_password || process.env.MYSQL_PASSWORD;
    const port = globalSettings.mysql_port || process.env.MYSQL_PORT || '3306';

    if (host && database && user) {
      try {
        const [hostname, defaultPort] = host.includes(':') ? host.split(':') : [host, port || '3306'];
        const connection = await mysql.createConnection({
          host: hostname,
          port: Number(defaultPort || 3306),
          database,
          user,
          password: password || '',
          connectTimeout: 3000
        });

        // Try querying stats for player
        const [killsRows] = await connection.execute(
          `SELECT s.value FROM ajlb_statistic_player_kills s INNER JOIN ajlb_extras e ON s.id = e.id WHERE LOWER(e.name) = ? LIMIT 1`,
          [cleanUsername.toLowerCase()]
        ).catch(() => [[]]);

        if (Array.isArray(killsRows) && killsRows.length > 0) {
          stats.kills = Number((killsRows[0] as any).value || 0);
        }

        const [playtimeRows] = await connection.execute(
          `SELECT s.value FROM ajlb_statistic_hours_played s INNER JOIN ajlb_extras e ON s.id = e.id WHERE LOWER(e.name) = ? LIMIT 1`,
          [cleanUsername.toLowerCase()]
        ).catch(() => [[]]);

        if (Array.isArray(playtimeRows) && playtimeRows.length > 0) {
          stats.playtime = Number((playtimeRows[0] as any).value || 0);
        }

        await connection.end();
      } catch (err) {
        console.log("MySQL player stats fetch fallback:", err);
      }
    }

    return res.json({
      username: cleanUsername,
      isStaff: !!staffMember,
      staffRank: staffRankName,
      storeRank: storeRankBadge || (staffMember ? staffRankName : 'Member'),
      totalSpent,
      purchases: userPurchases,
      orders: userOrders,
      profile: userProfile || null,
      stats
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch player profile" });
  }
});

// Fallback JSON 404 handler for any unhandled /api/* endpoints
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.path} not found` });
});

// Global JSON error handling middleware for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
  next(err);
});

// Serve static/compiled assets or mount Vite Dev Server
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

boot();
