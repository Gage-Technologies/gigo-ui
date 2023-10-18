const CONTENDA =
    `from requests import request
def work(): 
    frontend = "did frontend work in react"
    backend = "python + flask, AWS Lambda, EC2 and S3"
    return frontend + " " + backend
def time():
    start = "aug 2021"
    end = "oct 2021"
    return start + " " + end
def location():
    return "philly"
`

const GS =
    `public class GoldmanSachs {
    private String DATE = "Jun 2022 - Aug 2022";
    private String LOCATION = "New York, NY";
    public static boolean testContracts(MicroService A, MicroService B) {
        if (A.contract == B.contract) {
            return true;
        
        return false;
    }
    public static Stub generateStub(OpenAPI spec) {
        Stub stub = spec.convert();
        stub.upload();
        return stub;
    }
    public static void writeOnboardingDocs(Team team) {
        List<String> requirements = team.getOnboardingRequirements();
        for (int i = 0; i < requirements.length(); i++) {
            System.out.println(requirements[i]);
        }
    }
}
`

const OBERLIN =
    `async function classes(url) {
  await fetch(url).then(function (response) {
      return response.json();
  }).then(function (data) {
      console.log(data);
  }).catch(function () {
      console.log("Error");
  });
console.log('Systems Programming, Computer Science Theory, Algorithms, Privacy and Security')
// Also Men's DIII Lacrosse
}
    
    
`

const NYU =
    `.Machine_Learning {
  position: absolute;
  left: -6px;
  color: #cccccc;
  text-align: right;
  width: 40px;
  font-weight: 100;
  fontfamily: "Monaco, Menlo, Consolas, 'Droid Sans Mono', 'Inconsolata' 'Courier New', monospace";
  fontsize: 14;
}
.Artificial_Intellegence {
  background: #f7ebc6;
  box-shadow: inset 5px 0 0 #f7d87c;
  z-index: 0;
}
.Distributed_Systems {
  counter-reset: line;
}
.Operating_Systems {
  background: #f7ebc6;
  box-shadow: inset 5px 0 0 #f7d87c;
  z-index: 0;
}
.Computer_Graphics {
  outline: none;
  padding-left: 60px !important;
}
.Algorithms {
  padding-left: 60px !important;
}
.Privacy_and_Security {
  color: #9cdcfe;
}
      
`

const DELOITTE =
    `
`

const SKILLS =
    `#include <string>
#include <vector>
#include <iostream>
using namespace std;
int main()
{
    string s = "My skills include: ";
    vector<string> l = {
        "Python",
        "C++",
        "Java",
        "Javascript",
        "React",
        "React Native",
        "Node",
        "Docker",
        "AWS",
        "Spring",
        "Among others..."};
    cout << s << endl;
    int size = sizeof(l) / sizeof(l[0]);
    for (int i = 0; i < size; i++)
    {
        cout << l[i] << endl;
    }
    return 0;
}
`

const EXCOS =
    `
`

const IDK =
    `.place {
    background-color: powderblue;
}
.for {
    color: blue;
}
.anything {
    color: red;
}
`

const index_js =
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import "../../../index.css"
<!--import App from './App';-->
import EditorTester from "../../../pages/editorTester";
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <EditorTester />
  </React.StrictMode>
);

`

const index_html =
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the 'public' folder during the build.
      Only files inside the 'public' folder can be referenced from the HTML.
      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running 'npm run build'.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.
      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.
      To begin the development, run 'npm start' or 'yarn start'.
      To create a production bundle, use 'npm run build' or 'yarn build'.
    -->
  </body>
</html>
`

const package_json =
    `{
    "name": "portfolio-txt-editor",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
      "@testing-library/jest-dom": "^5.16.4",
      "@testing-library/react": "^13.3.0",
      "@testing-library/user-event": "^13.5.0",
      "@types/jest": "^27.5.2",
      "@types/node": "^16.11.45",
      "@types/react": "^18.0.15",
      "@types/react-dom": "^18.0.6",
      "@uiw/react-textarea-code-editor": "^2.0.3",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-icons": "^4.4.0",
      "react-prism-editor": "^1.1.2",
      "react-scripts": "5.0.1",
      "react-simple-code-editor": "^0.11.2",
      "typescript": "^4.7.4",
      "web-vitals": "^2.1.4"
    },
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    "eslintConfig": {
      "extends": [
        "react-app",
        "react-app/jest"
      ]
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    },
    "devDependencies": {
      "@types/prismjs": "^1.26.0",
      "autoprefixer": "^10.4.7",
      "postcss": "^8.4.14",
      "tailwindcss": "^3.1.6"
    }
  }  
`

export const files2strings = {
    'Contenda.py': CONTENDA,
    'GoldmanSachs.java': GS,
    'Oberlin.js': OBERLIN,
    'NYU.css': NYU,
    'Deloitte.css': DELOITTE,
    'Skills.cpp': SKILLS,
    'Excos.jsx': EXCOS,
    'IDK.css': IDK,
    'index.js': index_js,
    'index.html': index_html,
    'package.json': package_json,
    'none': "",

}