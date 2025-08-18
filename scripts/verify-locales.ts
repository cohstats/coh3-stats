import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';
import nextI18NextConfig from '../next-i18next.config';

interface LocaleConfig {
  i18n: {
    locales: string[];
    defaultLocale: string;
  };
}

const getAllKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // If it's an object (but not an array), recurse and don't add the parent key
      keys = keys.concat(getAllKeys(obj[key], newKey));
    } else {
      // If it's a leaf value (string, number, boolean, array), add the key
      keys.push(newKey);
    }
  }
  return keys;
};

const compareLocaleFiles = (enFilePath: string, localeFilePath: string): string[] => {
  const enFile = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  const localeFile = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));

  const enKeys = getAllKeys(enFile).sort();
  const localeKeys = getAllKeys(localeFile).sort();

  return enKeys.filter(key => !localeKeys.includes(key));
};

const createOrUpdateIssue = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  locale: string,
  issueBody: string,
  hasMissingFiles: boolean,
  hasMissingKeys: boolean
) => {
  let statusEmoji = '✅';

  if (hasMissingFiles && hasMissingKeys) {
    statusEmoji = '❌ ⚠️';
  } else if (hasMissingFiles) {
    statusEmoji = '❌';
  } else if (hasMissingKeys) {
    statusEmoji = '⚠️';
  }

  const issueTitle = `${statusEmoji} Locale Verification: ${locale}`;

  // Search for existing issue
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    labels: 'localization',
  });

  // Find issue by locale name rather than exact title match since emojis might change
  const existingIssue = issues.find(issue => issue.title.includes(`Locale Verification: ${locale}`));

  if (existingIssue) {
    // Update existing issue
    await octokit.issues.update({
      owner,
      repo,
      issue_number: existingIssue.number,
      title: issueTitle,
      body: issueBody,
    });
  } else {
    // Create new issue
    await octokit.issues.create({
      owner,
      repo,
      title: issueTitle,
      body: issueBody,
      labels: ['localization'],
    });
  }
};

const main = async () => {
  // For local testing, we'll just log the results instead of creating GitHub issues
  const isLocalTest = !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY;

  let octokit: Octokit | null = null;
  let owner = '';
  let repo = '';

  if (!isLocalTest) {
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get repository info from environment
    [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
    if (!owner || !repo) {
      throw new Error('GITHUB_REPOSITORY environment variable is not set');
    }
  }

  // Use the imported nextI18NextConfig
  const config: LocaleConfig = nextI18NextConfig;

  const locales = config.i18n.locales;
  const enFiles = fs.readdirSync('public/locales/en')
    .filter(file => file.endsWith('.json'));

  console.log(`\n🔍 Verifying locales for ${locales.length} languages...`);
  console.log(`📁 Found ${enFiles.length} English locale files: ${enFiles.join(', ')}\n`);

  for (const locale of locales) {
    if (locale === 'en') continue;

    const localeDir = path.join('public/locales', locale);
    let issueBody = '';
    let hasMissingFiles = false;
    let hasMissingKeys = false;

    console.log(`\n🌍 Checking locale: ${locale}`);

    // Check if locale directory exists
    if (!fs.existsSync(localeDir)) {
      issueBody = `❌ Locale directory for ${locale} does not exist.\n\n`;
      hasMissingFiles = true;
      console.log(`  ❌ Directory missing: ${localeDir}`);
    } else {
      issueBody = `✅ Locale directory exists.\n\n`;
      console.log(`  ✅ Directory exists: ${localeDir}`);

      // Check each English file exists in the locale
      for (const file of enFiles) {
        const localeFilePath = path.join(localeDir, file);
        if (!fs.existsSync(localeFilePath)) {
          issueBody += `❌ Missing file: ${path.join('public/locales', locale, file)}\n`;
          hasMissingFiles = true;
          console.log(`    ❌ Missing file: ${file}`);
        } else {
          const missingKeys = compareLocaleFiles(
            path.join('public/locales/en', file),
            localeFilePath
          );
          if (missingKeys.length > 0) {
            issueBody += `⚠️ Missing keys in ${path.join('public/locales', locale, file)}:\n\`\`\`\n${missingKeys.join('\n')}\n\`\`\`\n`;
            hasMissingKeys = true;
            console.log(`    ⚠️ Missing ${missingKeys.length} keys in ${file}:`);
            missingKeys.forEach(key => console.log(`      - ${key}`));
          } else {
            console.log(`    ✅ All keys present in ${file}`);
          }
        }
      }
    }

    if (!hasMissingFiles && !hasMissingKeys) {
      issueBody += `\n✅ All files and keys are present for ${locale} locale.`;
      console.log(`  🎉 ${locale} is complete!`);
    }

    // Only create GitHub issues if we're not in local test mode
    if (!isLocalTest && octokit) {
      await createOrUpdateIssue(octokit, owner, repo, locale, issueBody, hasMissingFiles, hasMissingKeys);
    }
  }

  if (isLocalTest) {
    console.log('\n📝 Local test completed. To create GitHub issues, set GITHUB_TOKEN and GITHUB_REPOSITORY environment variables.');
  }
};

main().catch(console.error);
