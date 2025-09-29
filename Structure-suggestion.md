nms-system/
│── README.md # Project overview + setup
│── .gitignore # Global ignores
│── docs/ # Diagrams, API specs, ML notes
│
│── nms-mobile/ # Android Studio project
│ └── ... # Standard Android project structure
│
│── nms-web/ # React web portal
│ ├── frontend/ # React app (hosted on Firebase Hosting)
│ ├── backend/ (optional) # Node.js server if needed
│ └── README.md
│
│── firebase/ # Firebase configs + cloud functions
│ ├── functions/ # Node.js Cloud Functions
│ │ ├── index.js
│ │ ├── package.json
│ │ └── ...
│ ├── firestore.rules # Firestore security rules
│ ├── storage.rules # Storage rules
│ └── firebase.json # Firebase project config
│
│── nms-ai/ # Python AI backend (Dockerized)
│ ├── models/ # Saved ML models
│ ├── agents/ # CrewAI/AutoGen agents
│ ├── api/ # FastAPI/Flask app
│ │ ├── main.py # Entry point
│ │ └── routes/
│ ├── requirements.txt # Python deps
│ ├── Dockerfile # For deployment
│ └── README.md
│
│── config/ # Shared configs
│ ├── env/ # Example .env files
│ ├── firebase-admin.json # Service account (ignored in git!)
│ └── payments/ # Stripe/PayPal sandbox config
│
└── tests/ # Testing
├── mobile/ # Android tests
├── web/ # Web tests
└── ai/ # AI backend tests
