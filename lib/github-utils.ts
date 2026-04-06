// GitHub API utility for fetching user repositories and extracting skills

const SKILL_KEYWORDS: Record<string, string> = {
  // Frontend
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  'react-native': 'React Native',
  vue: 'Vue',
  angular: 'Angular',
  html: 'HTML',
  css: 'CSS',
  tailwind: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  nuxt: 'Nuxt',
  svelte: 'Svelte',
  
  // Backend
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  'c#': 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
  
  // Databases
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  firebase: 'Firebase',
  redis: 'Redis',
  elasticsearch: 'Elasticsearch',
  dynamodb: 'DynamoDB',
  
  // DevOps & Tools
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  jenkins: 'Jenkins',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  heroku: 'Heroku',
  vercel: 'Vercel',
  
  // Testing & QA
  jest: 'Jest',
  mocha: 'Mocha',
  chai: 'Chai',
  selenium: 'Selenium',
  cypress: 'Cypress',
  
  // Other
  graphql: 'GraphQL',
  rest: 'REST API',
  websocket: 'WebSocket',
  oauth: 'OAuth',
  jwt: 'JWT',
  api: 'API Development',
  ml: 'Machine Learning',
  ai: 'Artificial Intelligence',
  tensorflow: 'TensorFlow',
  'machine-learning': 'Machine Learning',
};

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
}

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  html_url: string;
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const user: GitHubUser = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return [];
    }

    const repos: GitHubRepo[] = await response.json();
    return repos;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export function extractSkillsFromRepos(repos: GitHubRepo[]): string[] {
  const foundSkills = new Set<string>();

  repos.forEach((repo) => {
    // Extract from language
    if (repo.language) {
      const normalizedLanguage = repo.language.toLowerCase();
      const skill = matchSkillByLanguage(normalizedLanguage);
      if (skill) foundSkills.add(skill);
    }

    // Extract from topics
    if (repo.topics && Array.isArray(repo.topics)) {
      repo.topics.forEach((topic) => {
        const normalizedTopic = topic.toLowerCase();
        const skill = matchSkillByKeyword(normalizedTopic);
        if (skill) foundSkills.add(skill);
      });
    }

    // Extract from description and name
    const textContent = `${repo.name} ${repo.description || ''}`.toLowerCase();
    Object.keys(SKILL_KEYWORDS).forEach((keyword) => {
      if (textContent.includes(keyword)) {
        foundSkills.add(SKILL_KEYWORDS[keyword]);
      }
    });
  });

  return Array.from(foundSkills).sort();
}

export async function fetchStudentSkillsFromGitHub(
  username: string
): Promise<{ skills: string[]; githubUrl: string; error?: string }> {
  try {
    // Validate username
    if (!username || typeof username !== 'string') {
      return {
        skills: [],
        githubUrl: '',
        error: 'Invalid GitHub username',
      };
    }

    // Fetch GitHub user
    const user = await fetchGitHubUser(username);
    if (!user) {
      return {
        skills: [],
        githubUrl: '',
        error: `GitHub user "${username}" not found`,
      };
    }

    // Fetch repos
    const repos = await fetchGitHubRepos(username);
    if (repos.length === 0) {
      return {
        skills: [],
        githubUrl: user.html_url,
        error: 'No public repositories found',
      };
    }

    // Extract skills
    const skills = extractSkillsFromRepos(repos);

    return {
      skills,
      githubUrl: user.html_url,
    };
  } catch (error) {
    console.error('Error fetching skills from GitHub:', error);
    return {
      skills: [],
      githubUrl: '',
      error: 'Failed to fetch GitHub data',
    };
  }
}

function matchSkillByLanguage(language: string): string | null {
  // Exact match first
  if (SKILL_KEYWORDS[language]) {
    return SKILL_KEYWORDS[language];
  }

  // Partial matches
  for (const [key, value] of Object.entries(SKILL_KEYWORDS)) {
    if (language.includes(key) || key.includes(language)) {
      return value;
    }
  }

  return null;
}

function matchSkillByKeyword(keyword: string): string | null {
  // Exact match
  if (SKILL_KEYWORDS[keyword]) {
    return SKILL_KEYWORDS[keyword];
  }

  // Partial matches
  for (const [key, value] of Object.entries(SKILL_KEYWORDS)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return value;
    }
  }

  return null;
}
