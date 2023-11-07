/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars are explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  featuresSidebar: [
    {
      type: "category",
      label: "Features",
      collapsible: true,
      collapsed: false,
      link: { type: "doc", id: "features/features" },
      items: [
        "features/ai-models",
        "features/control",
        "features/acceleration",
        "features/extensions",
      ],
    },
  ],

  docusSidebar: [
    "guides/overview",
    {
      type: "category",
      label: "Getting started",
      collapsible: true,
      collapsed: true,
      link: { type: "doc", id: "guides/getting-started"},
      items: [
        {
          type: "category",
          label: "Installation",
          items: [
            "guides/install/mac",
            "guides/install/windows",
            "guides/install/linux",
            "guides/install/wsl",
            "guides/install/build-from-codebase",
            "guides/install/cloud-native",
          ],
        },
        "guides/download-model",
        "guides/start-model",
        "guides/start-conversation",
        'guides/delete-model',
        "guides/uninstallation",
        "guides/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Guides",
      collapsible: true,
      collapsed: true,
      link: { type: "doc", id: "developers/guides"},
      items: [
        {
          type: 'category',
          label: 'Anatomy of Jan',
          items: [
            "developers/anatomy/platform",
            "developers/anatomy/workflow",
            "developers/anatomy/synchronous",
            "developers/anatomy/asynchronous"
          ],
        },
        {
          type: 'category',
          label: 'Build and publish an app',
          items: [
            "developers/apps/build-an-app",
            "developers/apps/publish-jan-app",
          ],
        },
        {
          type: "category",
          label: "Apps",
          collapsible: true,
          collapsed: true,
          items: [
            {
              type: "autogenerated",
              dirName: "developers/plugins",
            },
          ],
        },
        {
          type: "category",
          label: "API Reference",
          collapsible: true,
          collapsed: true,
          items: [
            {
              type: "autogenerated",
              dirName: "reference",
            },
          ],
        },
      ],
    }
  ],

  nitroSidebar: [
    {
      type: "category",
      label: "Nitro",
      collapsible: true,
      collapsed: false,
      link: { type: "doc", id: "nitro/nitro" },
      items: [
        "nitro/architecture",
        "nitro/using-nitro",
      ],
    },
  ],

  communitySidebar: [
    'developers/developers',   
    'developers/what-can-i-do',
  ],

  companySidebar: [
    {
      type: "category",
      label: "Team",
      collapsible: true,
      collapsed: true,
      link: { type: "doc", id: "developers/contributor"},
      items: [
        "developers/people/daniel",
        "developers/people/nicole",
        "developers/people/louis",
        "developers/people/alan",
        "developers/people/hiro",
        "developers/people/james",
        "developers/people/hien",
        "developers/people/faisal",
        "developers/people/ashley",
        "developers/people/diane",
        "developers/people/rex",
      ],
    },
    {
      type: "category",
      label: "Company Handbook",
      collapsible: true,
      collapsed: true,
      // link: { type: "doc", id: "handbook/handbook" },
      items: [
        {
          type: "doc",
          label: "Engineering",
          id: "handbook/engineering/engineering",
        },
      ],
    },
    {
      type: "link",
      label: "Careers",
      href: "https://janai.bamboohr.com/careers",
    },
    {
      type: "category",
      label: "Events",
      collapsible: true,
      collapsed: true,
      items: [
        "events/nvidia-llm-day-nov-23",
        {
          type: "doc",
          label: "Oct 23: HCMC Hacker House",
          id: "events/hcmc-oct23",
        },
      ],
    },
  ],

  aboutSidebar: [
    {
      type: "doc",
      label: "About Jan",
      id: "about/about",
    },
  ],
};

module.exports = sidebars;
