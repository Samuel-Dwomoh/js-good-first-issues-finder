const axios = require('axios');
const fs = require('fs');
const env = require('dotenv');
env.config();

const apiUrl = 'https://api.github.com';
const token = process.env.API_KEY;

const getGoodFirstIssues = async () => {
  try {
    const repos = await axios.get(`${apiUrl}/search/repositories`, {
      headers: { Authorization: `token ${token}` },
      params: { q: `good-first-issues:>2`, language:'javascript', sort: 'updated' },
    });
    const goodFirstIssues = [];

    for (const repo of repos.data.items) {
      const issues = await axios.get(`${apiUrl}/repos/${repo.full_name}/issues`, {
        headers: { Authorization: `token ${token}` },
        params: { state: 'open', labels: "good first issue" },
      });
      if (issues.data.length > 0) {
        goodFirstIssues.push({ repo: repo.full_name, issues: issues.data });
      }
    }

    let markdown = `# Good First Issues\n\nThis is a list of javascript repositories with good first issues for newcomers to open source. Contributions are welcome!\n\n`;
    markdown += `This list gets updated every day at midnight.\n\n`;
    for (const issue of goodFirstIssues) {
      markdown += `## [${issue.repo}](${issue.url})\n\n`;
      for (const item of issue.issues) {
        markdown += `- [${item.title}](${item.html_url})\n`;
      }
      markdown += '\n';
    }


    fs.writeFileSync('README.md', markdown);
  } catch (error) {
    console.error(error);
  }
};

getGoodFirstIssues();