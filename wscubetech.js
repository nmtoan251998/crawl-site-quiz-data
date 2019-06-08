const puppeteer = require('puppeteer');
const fs = require('fs');

// Template string ES6
function writeFile(data, filename) {
    fs.writeFile(__dirname + `/datum/${filename}.json`, data, function(err) {
        if(err) return false;     
        return true;
    });    
}

const getQuizData = async (page) => {    
    const data = await page.evaluate(async () => {          
        let data = [];                
        
        document.getElementById('starttest').click();                
                
        let recentQuest = 0;

        let questions = document.querySelectorAll('.questionnumber');
        let answers = document.querySelectorAll('.answer');        
        questions.forEach(question => {                    
            data.push({
                question: question.textContent,
                answer: Array.from(answers[recentQuest].children).filter(el => {
                            if(el.getAttribute('class') === "a_ans") {
                                return { content: '', isCorrect: false }
                            }                    
                        }).map(textEl => {
                            return {
                                content: textEl.textContent.trim(),
                                isCorrect: false
                            }
                        }),
                detail: '',
            })            
            recentQuest++;
        })         
        
        return data
    })      
    return data
}
    
(async () => {    
    const browser = await puppeteer.launch({ devtools: true });
    const page = await browser.newPage();    

    const topics = ['html', 'html5', 'css', 'css3', 'javascript', 'mysql', 'seo', 'jquery', 'c', 'cpp', 'php'];    
    
    for(let recentTopic = 0; recentTopic < topics.length; recentTopic++) {
        let topic = topics[recentTopic];
        let url = `https://www.wscubetech.com/quiz-test-${topic}`;

        await page.goto(url);

        let data = await getQuizData(page);                    

        if(data)  {        
            let JSONFile = JSON.stringify(data, null, '\t');
            if(writeFile(JSONFile, topic) === true) {
                await browser.close()
            }            
        }
    }                    
})();