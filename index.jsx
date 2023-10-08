import React from 'react';
import ReactDOM from "react-dom/client";

import he from 'he'
// he.decode('str')

function App (){
    const [result, setResult] = React.useState(true);
    const [newQuiz, setNewQuiz] = React.useState(true);
    const [answers, setAnswers] = React.useState([]);
    const [question, setQuestion] = React.useState([]);
    const [hit, setHit] = React.useState(-1);
    const [data, setData] = React.useState([]);
    const [isQuiz, setIsQuiz] = React.useState(false);
    const [isResult, setIsResult] = React.useState(false);
    const [difficulty, setDifficulty] = React.useState('easy'); // easy medium hard
    const [quantity, setQuantity] = React.useState(5); // max 50

    const handleDifficulty = (event) => {
        setDifficulty(prevState => event.target.value);
    }
    
    const handleQuantity = (event) => {
        setQuantity(prevState => {
            if(event.target.value <= 0 || event.target.value > 50){
                return prevState;
            }else{
                return event.target.value;
            }
        });
    }

    React.useEffect(()  => {
        async function getData(){
            let response = await fetch("https://opentdb.com/api.php?amount=" + quantity + "&category=9&type=multiple&difficulty="  + difficulty);    
            let newRes = await response.json();
            return newRes;
        } 
        getData().then(res => setData(res.results));
    }, [ difficulty, quantity]);


    const handleChoose = (event) => {
        const id = event.target.id;
        document.getElementById(id).blur();
        const parentId = event.target.parentNode.parentNode.id;
        setAnswers( prevState => {
            const index = question.indexOf(parentId);
            const newArr =  prevState[index].map(element => {
                if(element.answer === id ){
                    document.getElementById(id).classList.add('choosed');
                }else{
                    document.getElementById(element.answer).classList.remove('choosed');
                }
                return ({
                    ...element,
                    isChoosed: element.answer === id ? true : false
                });
            });
            const next = [
                ...prevState.slice(0, index),
                newArr,
                ...prevState.slice(index+1)
              ];
            return next;
        });
    };

    React.useEffect(()=>{
        async function getData(){
            let response = await fetch("https://opentdb.com/api.php?amount=" + quantity + "&category=9&type=multiple&difficulty="  + difficulty);    
            let newRes = await response.json();
            return newRes;
        } 
        getData().then(res => setData(res.results));
        setHit(0)

        data.forEach(element => {
            setQuestion(prevState => {
                return [...prevState, he.decode(element.question)];
            });
            let {correct_answer, incorrect_answers} = element;
            let arr  = [{
                answer: he.decode(correct_answer),
                isCorrect: true,
                isChoosed: false,
            }];
            incorrect_answers.forEach(element => {
                arr.push({
                    answer: he.decode(element),
                    isCorrect: false,
                    isChoosed: false,
                });
            });
            const shuffle = (array) => { 
                for (let i = array.length - 1; i > 0; i--) { 
                    const j = Math.floor(Math.random() * (i + 1)); 
                    [array[i], array[j]] = [array[j], array[i]]; 
                } 
                return array; 
            }; 
            arr = shuffle(arr); 
            setAnswers(prevState => {
                return [...prevState, arr];
            });
        });
    }, [newQuiz]);

    const handleStart = () => {
        setAnswers([]);
        setQuestion([]);
        setHit(prevState => prevState === -1 ? -1 : 0);
        setIsQuiz(true);
        setNewQuiz(prevState => !prevState);
    }
    
    const handleNewQuiz = () => {
        handleStart()
        setIsResult(false);
        document.querySelectorAll('button').forEach(element => {
            element.classList.remove('choosed');
            element.classList.remove('correct');
            element.classList.remove('wrong');
        });
        if(hit != -1){
            document.getElementById('btn-result').style.display = 'block'; 
            document.getElementById('btn-new-quiz').blur()
        }

    };

    React.useEffect(() => {
        answers.forEach((res) => {
            let correct = false;
            res.forEach(element => {
                document.getElementById(element.answer).classList.remove('choosed');
                if ( element.isCorrect && element.isChoosed ){
                    document.getElementById(element.answer).classList.add('correct');
                    setHit(prevState => prevState === -1 ? 1 : prevState+1 );
                    correct = true;
                }
            });
            if(!correct){
                res.forEach((element) => {
                    if ( element.isCorrect){
                        document.getElementById(element.answer).classList.add('correct');
                    }else if( element.isChoosed ){
                        document.getElementById(element.answer).classList.add('wrong');                    
                    }
                });
            }
        });
    }, [result]);

    const handleResult = () => {
        document.getElementById('btn-result').style.display = 'none'; 
        document.getElementById('btn-result').blur();
        setResult(prevState => !prevState);
        setIsResult(true);
    };

    return(
        <div id="wrapper">
            {
                isQuiz ? 
                    <>
                    <hr />
                    <ListOfQuestion question={question} answers={answers} handleChoose={handleChoose} />
                    <button className="btn" id="btn-result" onClick={handleResult}>Check Answers</button>
                    </>
                    :   <div className="init">
                            <h1>Quizzical</h1>
                            <button className="btn" onClick={handleStart}>New Quiz</button>
                            <div className='config'>
                                <ConfigQuiz handleDifficulty={handleDifficulty} handleQuantity={handleQuantity} quantity={quantity} />
                            </div>
                        </div>
            }
            {
                isResult ? 
                <div id="config-newquiz">
                    <div className="result">
                        <span >You scored {hit} of {quantity}  quesions!</span>    
                        <button className="btn" id="btn-new-quiz" onClick={handleNewQuiz}>Play Again</button>
                    </div>
                    <div className='config'>
                        <ConfigQuiz handleDifficulty={handleDifficulty} handleQuantity={handleQuantity} quantity={quantity} />
                    </div>
                </div>
                    : null
            }
        </div>  
    );
}

function ListOfQuestion ({question, answers, handleChoose}) {
    return (question.map((element, index) => {
            return (
                <Question question={element} answers={answers[index]} handleChoose={handleChoose} />
            );
        })
    );
}

function Question ({question, answers, handleChoose}) {
    return (
        <div className="question" id={question}>
            <p>{question}</p>
            <ButtonRender answers={answers} handleChoose={handleChoose}/>
            <hr />
        </div>
    );
}

function ButtonRender({answers, handleChoose}) {
    const buttons = answers.map((ans) => {
        return (
            <button 
                id={ans.answer}
                key={ans.answer}
                onClick={handleChoose}
            >
                {ans.answer}
            </button>
        );
    });
    return (
        <div className='answers'>
            {buttons}
        </div>
    );
}

function ConfigQuiz({handleDifficulty, handleQuantity, quantity}) {
    const button = (
        <>
            <div className='config-btn'>
                <p>Difficulty</p>
                <button  value="easy" id="easy" onClick={handleDifficulty}>Easy</button>
                <button  value="medium" id="medium" onClick={handleDifficulty} >Medium</button>
                <button  value="hard" id="hard" onClick={handleDifficulty} >Hard</button>
            </div>
            <div className='quantity'>
                <label>Quantity<input type="number" value={quantity} onChange={handleQuantity}></input></label>
            </div>
        </>
    );
    return button;
}

/* Only run when page is full loaded */
document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.createRoot(document.getElementById('root')).render(<App />); 
}); 