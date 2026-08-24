/* All page copy lives here so App.tsx stays structural.
   Text is taken from docs/uoft_opp_doc.txt with minimal editing. */

export type Item = { title: string; desc: string };
export type Section = { label: string; items: Item[] };
export type Category = { id: string; label: string; sections: Section[] };

export const CATEGORIES: Category[] = [
  {
    id: 'awards',
    label: 'Awards',
    sections: [
      {
        label: 'Where to look',
        items: [
          {
            title: 'CS Department Scholarships',
            desc: 'web.cs.toronto.edu/undergraduate/scholarships',
          },
          {
            title: 'Award Explorer',
            desc: 'awardexplorer.utoronto.ca (search every UofT award by program and year)',
          },
          {
            title: 'Engineering Scholarships',
            desc: 'undergrad.engineering.utoronto.ca/fees-financial-aid/scholarships',
          },
        ],
      },
      {
        label: 'First year',
        items: [
          {
            title: 'The Mary Brant Award',
            desc: 'Highest overall standing in first year, normally in a Science program, plus a well-rounded personality shown through activities outside coursework.',
          },
        ],
      },
      {
        label: 'Early years',
        items: [
          {
            title: 'The J Alexander and Marion G Barker Langford Scholarship (up to $1,200)',
            desc: 'Victoria College students finishing Year 1 or 2 with high standing plus leadership in extracurricular university life.',
          },
          {
            title: 'Abella Prize in Canadian History',
            desc: 'Same criteria: high standing after Year 1 or 2 with demonstrated extracurricular leadership.',
          },
        ],
      },
      {
        label: 'Open to most',
        items: [
          {
            title: 'The Ben Chan Leadership Award (up to $1,100)',
            desc: 'GPA 3.0+, active leadership; preference for student government or student media.',
          },
          {
            title: 'The Larry Chapman Award (3 awards up to $1,000)',
            desc: 'Excellence in studies; preference for commerce, business, economics or law plus strong co-curriculars.',
          },
          {
            title: 'The John Grant Leadership Award (up to $1,500)',
            desc: 'B standing (GPA 3.0+); community building beyond student government preferred.',
          },
          {
            title: 'The Lisa Khoo and John Northcott Participation Award (up to $1,000)',
            desc: 'Excellence in studies; preference for student journalism, media or performing arts.',
          },
          {
            title: 'The Romans Family Scholarship (3 awards up to $1,500)',
            desc: 'A standing (GPA 3.50+) with significant extracurricular participation.',
          },
          {
            title: 'The Weeks and Anderson Scholarship ($1,000)',
            desc: 'Excellence in studies plus positive contribution to Victoria College or the broader community.',
          },
        ],
      },
      {
        label: 'Upper years',
        items: [
          {
            title: 'The David W Pretty Award',
            desc: 'Registered at Victoria College for Year 2 or 3, minimum overall B average, living in Vic residence. Name the award in your personal statement.',
          },
          {
            title: 'The Andy Zhuofan Chen Memorial Scholarship (up to $1,000)',
            desc: 'Excellence in studies; preference for Economics or Finance.',
          },
          {
            title: 'The William Neil Hanna Scholarship (not offered 2025)',
            desc: 'Third year; academic standing plus outstanding promise of leadership and public service.',
          },
          {
            title: 'The Joseph William Binning Scholarship (up to $1,100)',
            desc: 'Third year, high standing in previous years, prominent part in organized student activities.',
          },
          {
            title: 'The Ellis M Ostovich Scholarship (2 awards up to $1,200)',
            desc: 'Third year, overall A standing; preference for double majors with superior creative or charitable extracurriculars.',
          },
          {
            title: "1980's Legacy Scholarship",
            desc: 'Third year, excellence in studies; preference for students actively involved in the life of Victoria College.',
          },
        ],
      },
      {
        label: 'Any year',
        items: [
          {
            title: 'The Regents Participation Awards (multiple awards up to $1,500 each)',
            desc: 'Significant contribution to student life: athletics, stage productions, student government, student publications or volunteer services. Assessed at the end of Year 1, 2, 3 or 4.',
          },
        ],
      },
      {
        label: 'Research and writing',
        items: [
          {
            title: 'The Milne Research Award',
            desc: 'CGPA 3.50+, registered in a Life Science program. Summer research project, paid or volunteer, that is not part of a for-credit course.',
          },
          {
            title: 'The Arthur Irwin Prize',
            desc: 'Best writing outside coursework in a campus publication (The Strand, The Varsity, Acta Victoriana, UC Review). Note date and title of publication. Academic-journal essays are not eligible.',
          },
        ],
      },
    ],
  },

  {
    id: 'research',
    label: 'Research',
    sections: [
      {
        label: 'Where to look',
        items: [
          {
            title: 'Research Explorer',
            desc: 'undergraduateresearch.utoronto.ca/undergraduate-research-at-u-of-t/undergraduate-research-explorer',
          },
          {
            title: 'CS Everything but Internships',
            desc: 'github.com/Julian048/CS-Everything-but-Internships (any cs research related can be found here)',
          },
          { title: 'Opportunities list', desc: 'github.com/LuisaE/opportunities' },
          { title: 'Opportunity Search Tool', desc: 'sirop.org' },
          {
            title: 'Tips to get a research position at UofT',
            desc: 'alstonlo.github.io/blog/advice-on-cs-research',
          },
          {
            title: 'Computing Research Association',
            desc: 'sparc.cra.org',
          },
        ],
      },
      {
        label: 'UofT labs (email them)',
        items: [
          {
            title: 'Toronto Intelligent Systems Lab (TISL)',
            desc: 'tisl.cs.toronto.edu (apply 9 months before). They want upper-year students with experience in ML, SWE or Robotics.',
          },
          {
            title: 'Robot Vision and Learning Lab',
            desc: 'rvl.cs.toronto.edu/joining (mid January). Paid summer research. Expects one of the professor’s courses or AI-related CS/Engineering courses, or strong math-heavy or software engineering background. Apply through NSERC USRA, UofT UTEA, Engineering ESROP or Mitacs RTA.',
          },
          {
            title: 'The Mack Lab',
            desc: 'macklab.utoronto.ca (applications due September and May). Send CV and unofficial transcript to macklabuoft@gmail.com.',
          },
          {
            title: 'Dynamic Graphics Project (DGP)',
            desc: 'dgp.toronto.edu/join. Contact a DGP faculty member directly (exceptional undergrads can do a paid summer internship or take independent courses).',
          },
          {
            title: 'CleverHans Lab',
            desc: 'vectorinstitute.ai. Reach out to Prof. Nicolas Papernot for a summer internship.',
          },
          {
            title: 'Computational Social Science Lab',
            desc: 'csslab.cs.toronto.edu (reach out if you are interested)',
          },
          {
            title: 'embARC Research Group',
            desc: 'embarclab.com/contact (email nandita@cs.toronto.edu)',
          },
          {
            title: 'Human-Centered Data Science Lab',
            desc: 'hcds-uoft.ca (email hcds.uoft@gmail.com)',
          },
          {
            title: 'AI for Justice Lab',
            desc: 'aij.utoronto.ca/contact.html (email jia.xue@utoronto.ca)',
          },
          {
            title: 'Risk Lab',
            desc: 'risklab.ca (email chuting.wang@utoronto.ca)',
          },
          {
            title: 'Bernhardt-Walther Lab',
            desc: 'bwlab.org/about-us (email dirk.bernhardt.walther@utoronto.ca)',
          },
          {
            title: 'Interactive Media Lab',
            desc: 'imedia.mie.utoronto.ca (email chignell@mie.utoronto.ca)',
          },
        ],
      },
      {
        label: 'UofT programs',
        items: [
          {
            title: 'Research Opportunities Program (ROP)',
            desc: 'artsci.utoronto.ca/current/experiential-learning/research-opportunities/research-opportunities-program (March 16)',
          },
          {
            title: 'Research Excursions Program',
            desc: 'artsci.utoronto.ca/current/experiential-learning/research-opportunities/research-excursions-program (February 10 to March 2)',
          },
          {
            title: 'The Fields Undergraduate Summer Research Program (FUSRP)',
            desc: 'fields.utoronto.ca (student application January 5, faculty letter January 12). Solid foundation in undergraduate probability, optimization and linear algebra, or strong programming skills.',
          },
          {
            title: 'SUDS Opportunities Program',
            desc: 'datasciences.utoronto.ca/suds (January 24). Canadian citizen, permanent resident, or valid student visa for the full summer term, registered full-time at a Canadian university.',
          },
          {
            title: 'Urban Data Science Corps (UDSC)',
            desc: 'schoolofcities.utoronto.ca/learning-sofc/udsc (January 28)',
          },
          {
            title: 'CQIQC Undergraduate Summer Research Program',
            desc: 'cqiqc.physics.utoronto.ca/cqiqc-programs/undergraduates (December 15)',
          },
          {
            title: 'Dunlap Summer Undergraduate Research Program',
            desc: 'dunlap.utoronto.ca/training/surp (January 31)',
          },
          {
            title: 'SickKids Summer Research (SSuRe) Program',
            desc: 'sickkids.ca/en/research/about-research-institute (deadline listed under each job posting)',
          },
        ],
      },
      {
        label: 'Europe',
        items: [
          {
            title: 'ETH Student Summer Research Fellowship',
            desc: 'inf.ethz.ch/studies/summer-research-fellowship.html (1 November to 16 December)',
          },
          {
            title: 'EPFL Excellence Program',
            desc: 'epfl.ch/education/international/en/coming-to-epfl/research-internships (1 October to 30 November)',
          },
          {
            title: 'IST Scientific Internships (ISTernship)',
            desc: 'phd.pages.ist.ac.at/isternship (February 5, 15:00 CET)',
          },
          { title: 'Max Planck Institutes', desc: 'cis.mpg.de/internships (November 1)' },
          {
            title: 'Practical Research Experience Program (TUM PREP)',
            desc: 'international.tum.de/en/global/prep (November 22)',
          },
          {
            title: 'Goethe Research Experience Program (GREP)',
            desc: 'uni-frankfurt.de (January 31)',
          },
          {
            title: 'AScI International Summer Research Programme (Aalto)',
            desc: 'aalto.fi (7 to 31 January). Open to current bachelor’s or master’s students, or those who graduated at the end of the previous term.',
          },
          {
            title: 'SURF at INSAIT',
            desc: 'insait.ai/surf (17 January to 3 March)',
          },
          {
            title: 'UROP International (RWTH Aachen)',
            desc: 'rwth-aachen.de (January 10). GPA 3.2+, North American university student, willingness to take a German language course.',
          },
          {
            title: 'CERN Summer Student Programme and CERN openlab',
            desc: 'home.cern/summer-student-programme (November 29)',
          },
          {
            title: 'ASTRON/JIVE Summer Student Programme',
            desc: 'astron.nl/summerstudent (January 31, 23:59 CET)',
          },
          {
            title: 'Cambridge Summer Research Programme',
            desc: 'cruk.cam.ac.uk/students/undergraduate-summer-research-programme (early 2026)',
          },
          {
            title: 'Universidad Politecnica de Madrid Summer Research Internship',
            desc: 'upm.es (rolling)',
          },
          {
            title: 'The Cyprus Institute Summer Internships',
            desc: 'cyi.ac.cy (May 30)',
          },
          { title: 'HZDR Dresden', desc: 'hzdr.de (20 November and 23 February)' },
          {
            title: 'Programme de recherche pour talents internationaux (Ecole Polytechnique)',
            desc: 'programmes.polytechnique.edu (November and December)',
          },
          {
            title: 'Laidlaw Scholars Oxford Ethical Project',
            desc: 'internationalexperience.utoronto.ca (November 13)',
          },
        ],
      },
      {
        label: 'Asia and Middle East',
        items: [
          {
            title: 'Okinawa Institute of Science and Technology (OIST) Research Internship',
            desc: 'oist.jp/careers (April 15 for Fall, October 15 for Spring). Currently enrolled students need approval from their home institution.',
          },
          {
            title: 'HKU CDS Research Internship Programme',
            desc: 'cs.hku.hk/rintern (May 30, 17:00)',
          },
          {
            title: 'KIXLAB Summer Undergraduate Research Internship',
            desc: 'kixlab.org (April 30)',
          },
          { title: 'GRIPS Summer Internship (Zhejiang)', desc: 'grips.zju.edu.cn (6 January to 16 March)' },
          { title: 'fuSEP (USTC)', desc: 'fusep.ustc.edu.cn (April 13)' },
          { title: 'NSTC Internship (Taiwan)', desc: 'iipp.tw/program (September 15)' },
          {
            title: 'National Tsing Hua University Summer Program',
            desc: 'scholarsavenue.com/national-tsing-hua-university-summer-program (28 February)',
          },
          {
            title: 'Undergraduate Research Internship Program (UGRIP, MBZUAI)',
            desc: 'mbzuai.ac.ae/ugrip (February 28)',
          },
          {
            title: 'Kupcinet-Getz International Summer Program (Weizmann)',
            desc: 'weizmann-pages.co.il/kupcinet-getz-international-summer-program (February 19)',
          },
        ],
      },
      {
        label: 'North America',
        items: [
          {
            title: 'Stanford SURF',
            desc: 'engineering.stanford.edu/SURF (February 1). At least two semesters completed and one remaining; priority to rising juniors and seniors.',
          },
          {
            title: 'Research in Industrial Projects for Students (RIPS, UCLA)',
            desc: 'ipam.ucla.edu (February 3)',
          },
          {
            title: 'Undergraduate Research Fellowship (URF, Waterloo)',
            desc: 'cs.uwaterloo.ca (June 16)',
          },
          {
            title: 'Mitacs RISE Globalink Research Internship',
            desc: 'mitacs.ca/our-programs/rise-globalink-research-internship (November 30)',
          },
          {
            title: 'Los Alamos National Laboratory',
            desc: 'lanl.jobs (January 16)',
          },
          {
            title: 'AI4Good Lab',
            desc: 'ai4goodlab.com (opens December 9, closes January 13)',
          },
          {
            title: 'Google Summer of Code',
            desc: 'summerofcode.withgoogle.com (February 11)',
          },
        ],
      },
    ],
  },

  {
    id: 'internships',
    label: 'Internships',
    sections: [
      {
        label: 'Where to look',
        items: [
          { title: 'Levels.fyi internships', desc: 'levels.fyi/internships' },
          { title: 'The Fresh Dev', desc: 'thefreshdev.com/internships' },
          { title: 'Summer 2026 Internships', desc: 'github.com/vanshb03/Summer2026-Internships' },
          {
            title: 'Simplify Jobs internship list',
            desc: 'github.com/SimplifyJobs/Summer2025-Internships',
          },
          { title: 'Tech jobs', desc: 'techjobs.xyz' },
          {
            title: 'Application tracker (Notion)',
            desc: 'homefromcollege.notion.site (Internship and Job Application Tracker)',
          },
        ],
      },
      {
        label: 'First and second year programs',
        items: [
          {
            title: 'Google STEP',
            desc: 'google.com/about/careers/applications/students (25 October). First or second year undergrad in CS or a related field, familiarity with Java, Python or C++.',
          },
          {
            title: 'Meta University',
            desc: 'metacareers.com/careerprograms/pathways/metauniversity (late August to September)',
          },
          {
            title: 'Explore Microsoft Program',
            desc: 'careers.microsoft.com/v2/global/en/exploremicrosoft (around October or November)',
          },
          {
            title: 'Jane Street First-Year Trading and Technology Program (FTTP)',
            desc: 'janestreet.com/join-jane-street/programs-and-events/fttp (February 5, 23:59 ET)',
          },
          {
            title: 'Jane Street Immersion Program (JSIP)',
            desc: 'janestreet.com/join-jane-street/programs-and-events/jsip (February 9, 23:59 EST)',
          },
          {
            title: 'Duolingo Thrive Program',
            desc: 'blog.duolingo.com/duolingo-thrive-intern-program (October)',
          },
          {
            title: 'Uber Career Prep Fellowship',
            desc: 'hiddengeniusproject.org/ubercareerprep (June 13)',
          },
          {
            title: 'Uberstar Internship Program',
            desc: 'uber.com/us/en/careers/uberstar (August to November)',
          },
          { title: 'Netflix Formation', desc: 'formation.dev/partners/netflix' },
          {
            title: 'MLH Fellowship',
            desc: 'fellowship.mlh.io/programs/software-engineering (May 31)',
          },
          {
            title: 'IBM Extreme Blue Internship',
            desc: 'ibm.com/careers/blog/extreme-blue-ibms-leadership-program-for-future-tech-business-leaders',
          },
        ],
      },
      {
        label: 'Quant and finance',
        items: [
          {
            title: 'Discover Citadel',
            desc: 'citadel.com/careers/programs-and-events/discover-citadel',
          },
          {
            title: 'Citadel Datathons',
            desc: 'citadel.com/careers/programs-and-events/datathons (January 10). Undergraduates in good standing, 18+, at a university in the US or Canada, graduating between December 2026 and June 2028.',
          },
          {
            title: 'Fixed Income and Macro Central Bank Challenge',
            desc: 'citadel.com/careers/programs-and-events/the-fixed-income-macro-central-bank-challenge (February 22)',
          },
          {
            title: 'Citadel Associate Program',
            desc: 'citadel.com/careers/investing/citadel-associate-program. Highly selective; typically rising seniors or recent graduates with a GPA of 3.7+ in finance, computer science or engineering.',
          },
          { title: 'Point72', desc: 'careers.point72.com (internships)' },
          {
            title: 'Goldman Sachs Undergraduate Virtual Insight Series',
            desc: 'goldmansachs.com/careers/students (April 14, 23:55 ET)',
          },
          {
            title: 'Girls Who Invest Online Intensive Program',
            desc: 'girlswhoinvest.org/oip (October 1). Open to first-years and sophomores at four-year US or US-style colleges.',
          },
        ],
      },
      {
        label: 'Consulting',
        items: [
          {
            title: 'BCG Launch Program',
            desc: 'careers.bcg.com/global/en/on-campus/programs/bcg-launch (registration 21 January to 10 February)',
          },
          { title: 'Bain CREW', desc: 'bain.com/careers/work-with-us/internships-programs/crew' },
        ],
      },
      {
        label: 'UofT work integrated learning',
        items: [
          {
            title: 'Arts and Science Internship Program (ASIP)',
            desc: 'artsci.utoronto.ca/current/experiential-learning/internships/asip (June 10)',
          },
          {
            title: 'Level UP',
            desc: 'A digitally enabled work-integrated learning program that provides post-secondary students with paid project experiences.',
          },
          { title: 'CLNx', desc: 'clnx.utoronto.ca/home.htm' },
          { title: 'UNICEF Internships', desc: 'unicef.org/careers/internships (depends on the internship)' },
        ],
      },
      {
        label: 'Advice',
        items: [
          {
            title: 'Tips to land an internship (at Amazon)',
            desc: 'blog.michaelforde.com/amazon-internship-tips',
          },
          { title: 'SWE detailed guide', desc: 'docs.google.com (SWE Detailed Guide)' },
          {
            title: 'Detailed advice from a CS grad',
            desc: 'reddit.com/r/cscareerquestions (a college survival guide, very helpful and reassuring)',
          },
          { title: 'First year in order', desc: 'docs.google.com (1st year in order)' },
        ],
      },
    ],
  },

  { id: 'courses', label: 'Courses', sections: [] },

  {
    id: 'misc',
    label: 'Miscellaneous',
    sections: [
      {
        label: 'Leadership and certificates',
        items: [
          {
            title: 'Technology Leadership Program',
            desc: 'technologyleadershipinitiative.com/apply',
          },
          {
            title: 'ChangeMakers Certificate',
            desc: 'studentlife.utoronto.ca/program/changemakers-certificate',
          },
          { title: 'Certificate in Engineering Leadership (AECERLEA)', desc: '' },
          { title: 'CS Ambassadors', desc: 'web.cs.toronto.edu/undergraduate/ambassadors' },
          { title: 'CS Mentorship Program', desc: 'web.cs.toronto.edu/undergraduate/mentorship' },
        ],
      },
      {
        label: 'Competitions and hackathons',
        items: [
          {
            title: 'Putnam Competition',
            desc: 'maa.org/putnam (hints at math.toronto.edu/beni/putnam)',
          },
          { title: 'HackMIT', desc: 'hackmit.org (April 7)' },
          { title: 'Hoya Hacks', desc: 'hoyahacks.georgetown.domains' },
          { title: 'NASA Space Apps Challenge', desc: 'spaceappschallenge.org' },
          {
            title: 'Project Green Challenge',
            desc: 'projectgreenchallenge.com (October 1). Student aged 16 to 26 by October 1, enrolled through April 30 of the following year.',
          },
          {
            title: 'Hackathons for beginners',
            desc: 'geeksforgeeks.org/blogs/hackathons-for-beginners',
          },
        ],
      },
      {
        label: 'Entrepreneurship and fellowships',
        items: [
          {
            title: 'The Hatchery NEST',
            desc: 'hatchery.engineering.utoronto.ca/nest-info-page (January 31). As long as you have a startup idea.',
          },
          { title: 'Next 36 (Canada)', desc: 'nextcanada.com/next-36 (August 8 to October 15)' },
          { title: 'Y Combinator', desc: 'ycombinator.com (May 13, 20:00 PT)' },
          {
            title: 'Cansbridge Fellowship',
            desc: 'cansbridgefellowship.com (opens October 1, closes October 12). Weekly onboarding January to April, 9-day bootcamp in a North American hub in early May, then a minimum of 10 weeks in-person in Asia.',
          },
          {
            title: 'Neo Scholars',
            desc: 'neo.com/scholars (July 6, 23:59 PT). Undergrads graduating Winter 2025 or later, focused on students in the US and Canada.',
          },
          {
            title: 'Millennium Fellowship',
            desc: 'millenniumfellows.org. Undergraduate in good standing with a project idea addressing local or global issues, committing to at least 8 in-person convenings.',
          },
          {
            title: 'Resolution Fellows',
            desc: 'resolutionproject.org/become-a-resolution-fellow (September 24)',
          },
          {
            title: 'Global Good Fund Fellowship',
            desc: 'globalgoodfund.org/fellowship-program (July 1, 05:00)',
          },
          {
            title: 'Creative Destruction Lab',
            desc: 'creativedestructionlab.com/program (depends on the program)',
          },
          {
            title: 'University of Calgary STEM Fellowship',
            desc: 'stemfellowship.org/calgary-research-exploration-program (November 28 to January 13)',
          },
        ],
      },
      {
        label: 'Talks and seminars',
        items: [
          {
            title: 'CQIQC training activities',
            desc: 'cqiqc.physics.utoronto.ca/cqiqc-programs/training-activities',
          },
          {
            title: 'Troost ILead workshops',
            desc: 'ilead.engineering.utoronto.ca',
          },
          { title: 'RiskLab', desc: 'risklab.ca' },
          {
            title: 'The Entrepreneurship Hatchery',
            desc: 'hatchery.engineering.utoronto.ca (over 40 events per year)',
          },
        ],
      },
      {
        label: 'Exchange',
        items: [
          {
            title: 'Tsinghua University',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-tsinghua-university',
          },
          {
            title: 'University College London',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-university-college-london-ucl',
          },
          {
            title: 'IIT Bombay',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-indian-institute-of-technology-bombay',
          },
          {
            title: 'University of Edinburgh',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-university-of-edinburgh',
          },
          {
            title: 'Nanyang Technological University',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-nanyang-technological-university',
          },
          {
            title: 'National University of Singapore',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-national-university-of-singapore-nus',
          },
          {
            title: 'ETH Zurich',
            desc: 'learningabroad.utoronto.ca/experiences/exchange-eth-zurich-swiss-federal-institute-of-technology',
          },
          {
            title: 'NUS Enterprise Summer Program',
            desc: 'enterprise.nus.edu.sg/education-programmes/summer-programme (March 31)',
          },
        ],
      },
      {
        label: 'Language and writing',
        items: [
          {
            title: 'Scholarly Reading eWriting Intensive (EEL)',
            desc: 'artsci.utoronto.ca/current/academic-advising-and-support/english-language-learning. Free five-day online course (August 25 to 29, asynchronous) working on reading and writing using scholarly articles, with feedback on your work.',
          },
          {
            title: 'First-Year Foundations Seminars',
            desc: 'artsci.utoronto.ca/future/academic-opportunities/first-year-opportunities/first-year-foundations-seminars',
          },
          {
            title: 'Recognized Study Groups',
            desc: 'sidneysmithcommons.artsci.utoronto.ca/recognized-study-groups/join',
          },
          {
            title: 'Citation management',
            desc: 'guides.library.utoronto.ca/citationmanagement (Mendeley over EndNote and RefWorks)',
          },
        ],
      },
      {
        label: 'Tools',
        items: [
          { title: 'Class Find', desc: 'classfind.com/toronto' },
          { title: 'Degree Explorer', desc: 'acorn.utoronto.ca/degree-explorer' },
          { title: 'Timetable prototype', desc: 'icprplshelp.github.io/UofT-Timetable-Prototype-V2' },
          {
            title: 'Old exams',
            desc: 'onesearch.library.utoronto.ca/faq/where-can-i-find-old-exams',
          },
          { title: 'Free textbooks', desc: 'annas-archive.org, libgen.is' },
          {
            title: 'Free UofT resources',
            desc: 'reddit.com/r/UofT (a comprehensive list of free UofT resources)',
          },
          {
            title: 'Student discounts',
            desc: 'blogs.studentlife.utoronto.ca/lifeatuoft (UofT student discounts)',
          },
          {
            title: 'Vic academic advising',
            desc: 'vic.utoronto.ca/current-students/registrars-office/academic-advising',
          },
        ],
      },
    ],
  },
];
