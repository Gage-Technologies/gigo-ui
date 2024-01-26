import React, {useEffect, useState} from 'react';
import {
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    Container,
    PaletteMode,
    createTheme,
    ThemeProvider, CssBaseline,
} from '@mui/material';

import {getAllTokens} from "../theme";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import JourneyFormPageDeskIcon from "../components/Icons/JourneyFormPageDesk";
import JourneyQuizTrunkIcon from "../components/Icons/JourneyQuizTrunk";
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";

function JourneyQuiz() {
    const aspectRatio = useAspectRatio();
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // Define quiz questions and options
    const [questions] = useState([
        {
            "question": "What is a variable?",
            "code": "",
            "options": ["A sequence of characters", "A memory location that stores data", "A function that performs an operation", "A method to loop through data"],
            "correct": 1
        },
        {
            "question": "What is a recursive function?",
            "code": "",
            "options": ["A function that calls another function", "A function that returns multiple values", "A function that calls itself", "A function that never returns"],
            "correct": 2
        },
        {
            "question": "What does \"DRY\" stand for in programming?",
            "code": "",
            "options": ["Don't Repeat Yesterday", "Don't Repeat Yourself", "Data Returns Yes", "Data Request Yield"],
            "correct": 1
        },
        {
            "question": "What is the time complexity of binary search?",
            "code": "",
            "options": ["O(n)", "O(n log n)", "O(1)", "O(log n)"],
            "correct": 3
        },
        {
            "question": "What is the main purpose of Docker?",
            "code": "",
            "options": ["Web scraping", "Image editing", "Containerization", "Text processing"],
            "correct": 2
        },
        {
            "question": "What does CRUD stand for?",
            "code": "",
            "options": ["Create, Read, Update, Delete", "Compute, Retrieve, Update, Debug", "Compile, Run, Update, Deploy", "Convert, Review, Use, Destroy"],
            "correct": 0
        },
        {
            "question": "What is the CAP theorem?",
            "code": "",
            "options": ["A theory on encryption", "A principle for database design", "A model for network security", "A distributed system design principle"],
            "correct": 3
        },
        {
            "question": "What does REST stand for in API design?",
            "code": "",
            "options": ["Remote Entry Storage Table", "Representational State Transfer", "Request Estimation Standard Test", "Random Element Sort Technique"],
            "correct": 1
        },
        {
            "question": "What is Git mainly used for?",
            "code": "",
            "options": ["Web development", "Data analytics", "Version control", "Cloud storage"],
            "correct": 2
        },
        {
            "question": "What is the main use of a load balancer?",
            "code": "",
            "options": ["Data storage", "Encrypting data", "Distributing incoming network traffic", "Debugging applications"],
            "correct": 2
        },
        {
            "question": "What is a dead-lock in programming?",
            "code": "",
            "options": ["A function that takes a long time to execute", "Two or more operations waiting for each other to release resources", "When a variable goes out of scope", "A type of runtime error"],
            "correct": 1
        },
        {
            "question": "What is the key principle behind hashing?",
            "code": "",
            "options": ["Encryption", "Compression", "Uniqueness", "Replication"],
            "correct": 2
        },
        {
            "question": "What is a microservice?",
            "code": "",
            "options": ["A small program", "A type of small hardware", "An architectural style that structures an application as a collection of loosely coupled services", "A type of data storage mechanism"],
            "correct": 2
        },
        {
            "question": "What does ACID stand for in databases?",
            "code": "",
            "options": ["Atomicity, Consistency, Integrity, Durability", "Accuracy, Calculation, Input, Decryption", "Availability, Concurrency, Isolation, Durability", "Analysis, Creation, Insertion, Deletion"],
            "correct": 0
        },
        {
            "question": "What is a race condition?",
            "code": "",
            "options": ["A timed algorithm", "A type of exception", "A bug occurring when two or more operations must execute in a specific order but don't", "A multithreading concept involving speed optimization"],
            "correct": 2
        },
        {
            "question": "What is sharding in databases?",
            "code": "",
            "options": ["Encryption", "Archiving old data", "Horizontal data partitioning", "Data visualization"],
            "correct": 2
        },
        {
            "question": "What is the purpose of Kubernetes?",
            "code": "",
            "options": ["Game development", "Network monitoring", "Container orchestration", "Real-time messaging"],
            "correct": 2
        },
        {
            "question": "What is a message broker?",
            "code": "",
            "options": ["An encryption tool", "An intermediary program for translating messages between different computing languages", "A database model", "A version control system"],
            "correct": 1
        },
        {
            "question": "What is an SDK?",
            "code": "",
            "options": ["Software Delivery Kit", "System Design Kit", "Software Development Kit", "Server Deployment Kit"],
            "correct": 2
        },
        {
            "question": "What is functional programming?",
            "code": "",
            "options": ["A programming paradigm that treats computation as the evaluation of mathematical functions", "A programming language type", "A software development methodology", "A set of coding best practices"],
            "correct": 0
        },
        {
            "question": `What will be the output of the following pseudocode?`,
            "code": `
\`\`\`python
x = 5
y = 10
if x > y:
    print("A")
else:
    print("B")
\`\`\``,
            "options": ["A", "B", "Error", "None"],
            "correct": 1
        },
        {
            "question": `What will be the output of the following pseudocode?`,
            "code": `
\`\`\`python
sum = 0
for i = 1 to 4:
    sum = sum + i
print(sum)
\`\`\``,
            "options": ["10", "11", "9", "8"],
            "correct": 0
        },
        {
            "question": `What will be the output of the following pseudocode?`,
            "code": `
\`\`\`python
x = 1
while x < 4:
    x = x * 2
print(x)
\`\`\``,
            "options": ["1", "4", "8", "2"],
            "correct": 1
        },
        {
            "question": `What will be the output of the following pseudocode?`,
            "code": `
\`\`\`python
arr = [1, 2, 3, 4]
for i = 0 to len(arr) - 1:
    if arr[i] % 2 == 0:
        print(arr[i])
\`\`\``,
            "options": ["1, 3", "2, 4", "1, 2, 3, 4", "None"],
            "correct": 1
        },
        {
            "question": `What will be the output of the following pseudocode?`,
            "code": `
\`\`\`python
x = 3
y = 2
result = x ** y
print(result)
\`\`\``,
            "options": ["5", "9", "6", "8"],
            "correct": 3
        },
        {
            "question": `What is the time complexity of the following pseudocode?`,
            "code": `
\`\`\`python
for i = 1 to n:
   print(i)
\`\`\``,
            "options": ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
            "correct": 1
        },
        {
            "question": `What is the time complexity of the following pseudocode?`,
            "code": `
\`\`\`python
for i = 1 to n:
    for j = 1 to n:
        print(i, j)
\`\`\``,
            "options": ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
            "correct": 3
        },
        {
            "question": `What is the time complexity of the following pseudocode?`,
            "code": `
\`\`\`python
while i <= n:
    print(i)
    i = i * 2
\`\`\``,
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct": 2
        },
        {
            "question": `What is the time complexity of the following pseudocode?`,
            "code": `
\`\`\`python
for i = 1 to log(n):
    print(i)
\`\`\``,
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct": 2
        },
        {
            "question": `What is the time complexity of the following pseudocode?`,
            "code": `
\`\`\`python            
for i = 1 to n:
    j = 1
    while j <= n:
        print(i, j)
        j = j * 2
\`\`\``,
            "options": ["O(1)", "O(n log n)", "O(n)", "O(n^2)"],
            "correct": 1
        }
    ]);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleAnswerClick = (index: any) => {
        setSelectedAnswer(index);
    };

    const handleNextClick = () => {
        // Implement logic to check the answer and navigate to the next question
        // For demonstration, simply navigate to the next question
        setSelectedAnswer(null);
        setCurrentQuestion(currentQuestion + 1);
    };


    const iconDeskContainerStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                    : '95vw',
        height:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '54vh'
                    : chatOpen ? '54vh'
                        : '54vh'
                :
                sidebarOpen
                    ? '55vh'
                    : chatOpen ? '55vh'
                        : '55.5vh',
        position: 'relative',

        left:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '4%'
                    : chatOpen ? '4%'
                        : '2%'
                :
                sidebarOpen
                    ? '4.5%'
                    : chatOpen ? '6%'
                        : '2%',

        top:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '-25%'
                    : chatOpen ? '-15%'
                        : '-15%'
                :
                sidebarOpen
                    ? '0%'
                    : chatOpen ? '0%'
                        : '0%',

        zIndex: 0,

    };

    const iconStyles: React.CSSProperties = {
        width: '95%',
        height: '110%',
    };

    const vignetteStyles: React.CSSProperties = {
        width:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? 'calc(80vw - 15vw)'
                    : chatOpen ? 'calc(80vw - 17vw)'
                        : '80vw'
                :
                sidebarOpen
                    ? 'calc(87vw - 15vw)'
                    : chatOpen ? 'calc(87vw - 17vw)'
                        : '80vw',
        height:
            aspectRatio === '21:9' ?
                sidebarOpen ? 'calc(70vh - 64px)'
                    : chatOpen ? 'calc(70vh - 64px)'
                        : 'calc(87vh - 64px)'
                :
                sidebarOpen ? 'calc(90vh - 64px)'
                    : chatOpen ? 'calc(89vh - 64px)'
                        : 'calc(95vh - 64px)',
        background: `radial-gradient(circle, rgba(0,0,0,0) 40%, ${hexToRGBA(theme.palette.background.default)} 65%, ${hexToRGBA(theme.palette.background.default)} 83%), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(0deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)})`, // Vignette gradient
        position: 'absolute',
        left:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '11.5%'
                    : chatOpen ? '11.5%'
                        : '8%'
                :
                sidebarOpen
                    ? '4.5%'
                    : chatOpen ? '6%'
                        : '8%',
        top:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '0%'
                    : chatOpen ? '0%'
                        : '0%'
                :
                sidebarOpen
                    ? '0%'
                    : chatOpen ? '0%'
                        : '0%',
        bottom: (aspectRatio !== '21:9') && (sidebarOpen || chatOpen) ? '-1%' : '0%',
        zIndex: 2, // Set a higher zIndex to appear above the SVG
    };

    const mainDivStyles: React.CSSProperties = {
        position: 'relative',
        height: 'calc(90vh-64px)',
        overflow: 'hidden'
    }



    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div style={mainDivStyles}> {/* Container div */}
                    <Container style={{ paddingTop: '2em' }}>
                        {/* @ts-ignore */}
                        <Card style={{ backgroundColor: theme.palette.background.card }}>
                            <CardContent>
                                <Typography variant="h5" style={{ color: theme.palette.text.primary }}>
                                    {questions[currentQuestion].question}
                                </Typography>
                                <MarkdownRenderer markdown={questions[currentQuestion].code} style={{
                                    overflowWrap: "break-word",
                                    borderRadius: "10px",
                                    padding: "2em 3em",
                                    width: "100%"
                                }}/>
                                <Grid container spacing={3}>
                                    {questions[currentQuestion].options.map((option, index) => (
                                        <Grid item xs={6} key={index}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                style={{
                                                    width: '100%',
                                                    padding: '1em',
                                                }}
                                                onClick={() =>
                                                    handleAnswerClick(index)

                                            }
                                            >
                                                {option}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ marginLeft: 'auto' }}
                                    disabled={selectedAnswer === null}
                                    onClick={handleNextClick}
                                >
                                    Next
                                </Button>
                            </CardActions>
                        </Card>
                    </Container>
                    <div  style={iconDeskContainerStyles}>
                        <div style={vignetteStyles}/> {/* Vignette overlay */}
                        <JourneyQuizTrunkIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                    </div>
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

function hexToRGBA(hex: any, alpha = 1) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function useAspectRatio() {
    const [aspectRatio, setAspectRatio] = useState('');

    useEffect(() => {
        function gcd(a: any, b: any): any {
            return b === 0 ? a : gcd(b, a % b);
        }

        function calculateAspectRatio() {
            const width = window.screen.width;
            const height = window.screen.height;
            let divisor = gcd(width, height);
            ;
            // Dividing by GCD and truncating into integers
            let simplifiedWidth = Math.trunc(width / divisor);
            let simplifiedHeight = Math.trunc(height / divisor);

            divisor = Math.ceil(simplifiedWidth / simplifiedHeight);
            simplifiedWidth = Math.trunc(simplifiedWidth / divisor);
            simplifiedHeight = Math.trunc(simplifiedHeight / divisor);
            setAspectRatio(`${simplifiedWidth}:${simplifiedHeight}`);
        }

        calculateAspectRatio();

        window.addEventListener('resize', calculateAspectRatio);
        ;

        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}

export default JourneyQuiz;