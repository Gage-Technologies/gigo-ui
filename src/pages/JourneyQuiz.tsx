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
    ThemeProvider, CssBaseline, Tooltip,
} from '@mui/material';

import {
    clearJourneyFormState,
    JourneyFormStateUpdate,
    initialJourneyFormState,
    selectSection,
    selectLearningGoal,
    selectLanguageInterest,
    selectEndGoal,
    selectExperienceLevel,
    selectFamiliarityIDE,
    selectFamiliarityLinux,
    selectTriedProgramming,
    selectTriedProgrammingOnline,
    initialJourneyFormStateUpdate, updateJourneyFormState,
} from "../reducers/journeyForm/journeyForm";

import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import JourneyFormPageDeskIcon from "../components/Icons/JourneyFormPageDesk";
import JourneyQuizTrunkIcon from "../components/Icons/JourneyQuizTrunk";
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import r10Lvl from "../img/renown/r10Lvl.svg";
import renown1 from "../img/renown/renown1.svg"
import renown2 from "../img/renown/renown2.svg"
import renown3 from "../img/renown/renown3.svg"
import renown4 from "../img/renown/renown4.svg"
import renown5 from "../img/renown/renown5.svg"
import renown6 from "../img/renown/renown6.svg"
import renown7 from "../img/renown/renown7.svg"
import renown8 from "../img/renown/renown8.svg"
import renown9 from "../img/renown/renown9.svg"
import renown10 from "../img/renown/renown10.svg"
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

function JourneyQuiz() {
    const aspectRatio = useAspectRatio();
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();

    const reduxSectionState = useSelector(selectSection);
    const reduxLearningGoal = useSelector(selectLearningGoal);
    const reduxLanguageInterest = useSelector(selectLanguageInterest);
    const reduxEndGoal = useSelector(selectEndGoal);
    const reduxExperienceLevel = useSelector(selectExperienceLevel);
    const reduxTriedProgramming = useSelector(selectTriedProgramming);
    const reduxTriedProgrammingOnline = useSelector(selectTriedProgrammingOnline);
    const reduxFamiliarityIDE = useSelector(selectFamiliarityIDE);
    const reduxFamiliarityLinux = useSelector(selectFamiliarityLinux);

    const [journeyForm, setJourneyForm] = React.useState(
        {

            learningGoal: reduxLearningGoal,
            languageInterest: reduxLanguageInterest,
            endGoal: reduxEndGoal,
            experienceLevel: reduxExperienceLevel,
            triedProgramming: reduxTriedProgramming,
            triedProgrammingOnline: reduxTriedProgrammingOnline,
            familiarityIDE: reduxFamiliarityIDE,
            familiarityLinux: reduxFamiliarityLinux,
        }

    )

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
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [incorrect, setIncorrect] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [recRenown, setRecRenown] = useState(0);

    const handleAnswerClick = (index: any) => {
        setSelectedOptionIndex(index);
        setSelectedAnswer(index);
    };

    const handleNextClick = () => {

        console.log("selected answer: ", selectedAnswer, questions[currentQuestion]["correct"])

        // Implement logic to check the answer and navigate to the next question
        if (selectedAnswer != questions[currentQuestion]["correct"]) {
            setIncorrect(incorrect + 1);
        }else{
            setCorrect(correct + 1);
        }

        console.log("correct: ", correct, "incorrect: ", incorrect)

        // For demonstration, simply navigate to the next question
        setSelectedOptionIndex(null)
        setSelectedAnswer(null);
        setCurrentQuestion(currentQuestion + 1);
        console.log("current question: ", currentQuestion, questions.length);
    };

    const handleSubmit = async () => {
        console.log("score = ", correct, " / ", questions.length)
        console.log("score: ", correct/questions.length);

        setScore(correct/questions.length);
        setIsFinished(true);

        // let res = await call(
        //     "/api/reportIssue",
        //     "post",
        //     null,
        //     null,
        //     null,
        //     // @ts-ignore
        //     {page: stringSplit[3], issue: textFieldRef.current.value},
        //     null,
        //     config.rootPath
        // )

    }


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

    const handleRenownCheck = (score: number): [string, number] => {
        if (score < .1) return [renown1, 1];
        if (score < .2) return [renown2, 2];
        if (score < .3) return [renown3, 3];
        if (score < .4) return [renown4, 4];
        if (score < .5) return [renown5, 5];
        if (score < .6) return [renown6, 6];
        if (score < .7) return [renown7, 7];
        if (score < .8) return [renown8, 8];
        if (score < .9) return [renown9, 9];
        return [renown10, 10];
    }

    useEffect(() => {
        const [, renownValue] = handleRenownCheck(score);
        setRecRenown(renownValue);
    }, [score]);

    const navigate = useNavigate();


    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div style={mainDivStyles}> {/* Container div */}
                    <Container style={{ paddingTop: '2em', paddingBottom: '2em', height: "100%"}}>

                        {/* @ts-ignore */}
                        <Card style={{ backgroundColor: theme.palette.background.card }}>

                            {isFinished ? (
                                <><CardContent>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" style={{
                                                color: theme.palette.text.primary,
                                                textAlign: 'center'
                                            }}>
                                                You Scored
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" style={{
                                                color: theme.palette.text.primary,
                                                textAlign: 'center'
                                            }}>
                                                {Math.floor(score * 100)}%
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography variant="h5" style={{
                                                color: theme.palette.text.secondary,
                                                textAlign: 'center'
                                            }}>
                                                We have determined you to be
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <br/>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography variant="h5" style={{
                                                color: theme.palette.text.secondary,
                                                textAlign: 'center'
                                            }}>
                                                {score < .5 ? "Beginner" : score < .8 ? "Intermediate": "Expert" }
                                            </Typography>
                                        </Grid>
                                        <Grid id="image-renown" item xs={12} style={{ display: 'flex', justifyContent: 'center', height: "1%" }}>
                                            <Tooltip title={`Renown ${recRenown}`}>
                                                <img
                                                    style={{
                                                        height: "40vh",
                                                        width: "auto",
                                                        opacity: "0.85",
                                                        overflow: "hidden",
                                                        paddingTop: "10px"
                                                    }}
                                                    src={handleRenownCheck(score)[0]}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                </CardContent><CardActions>
                                    <Grid container>
                                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                style={{ marginLeft: 'auto' }}
                                                disabled={selectedAnswer === null}
                                                onClick={() => {navigate("/journey/main")}}
                                                // todo send placement and form results to function (pass in 'journeyForm')
                                            >
                                                Move On
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardActions></>

                            ) : (
                                <><CardContent>
                                    <><Typography variant="h5" style={{color: theme.palette.text.primary}}>
                                        {questions[currentQuestion].question}
                                    </Typography><MarkdownRenderer markdown={questions[currentQuestion].code}
                                                                   style={{
                                                                       overflowWrap: "break-word",
                                                                       borderRadius: "10px",
                                                                       padding: "2em 3em",
                                                                       marginBottom: "2em",
                                                                       width: "100%"
                                                                   }}/><Grid container spacing={6}>
                                        {questions[currentQuestion].options.map((option, index) => (
                                            <Grid item xs={6} key={index}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    style={{
                                                        width: '100%',
                                                        padding: '1em',
                                                        backgroundColor: selectedOptionIndex === index ? `${theme.palette.text.secondary}` : 'transparent',
                                                    }}
                                                    onClick={() => handleAnswerClick(index)}
                                                >
                                                    {option}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid></>
                                </CardContent><CardActions>

                                    {currentQuestion < questions.length - 1 ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            style={{marginLeft: 'auto'}}
                                            disabled={selectedAnswer === null}
                                            onClick={handleNextClick}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            style={{marginLeft: 'auto'}}
                                            disabled={selectedAnswer === null}
                                            onClick={handleSubmit}
                                        >
                                            Finish
                                        </Button>
                                    )}

                                </CardActions></>
                            )}



                        </Card>
                    </Container>

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
            console.log("divisor: ", divisor);
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
        console.log("aspectRatio: ", aspectRatio);

        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}

export default JourneyQuiz;