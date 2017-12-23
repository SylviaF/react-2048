'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/main.less';
import * as MyFB from '../component/fb.js';
import AlertPanel from '../component/alert.js';
import LeaderBoard from '../component/leaderBoard.js';
let alertPanel;
/* globals ga */
/*
** 格子
* @props key(int) 编号
* @props num(int) 状态 0-11
*/
class Grid extends React.Component {
    constructor(props) {
        super(props);
    }
    // 合法化
    legalIndex(num) {
        num = parseInt(num, 10) || 0;
        if (num > 11 || num < 0) {
            num = 0;
        }
        return num;
    }

    render() {
        this.num = this.legalIndex(this.props.num);
        return <div className="gridCnt"><div className={'grid grid' + (this.num || 0)}>
                {this.num ? Math.pow(2, this.num) : ''}
            </div></div>;
    }
}

/*
** 游戏面板
*/
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.winflag = false;
        this.width = 4;
        this.size = Math.pow(this.width, 2);
        this.state = {
            data: Array.from(new Array(this.size), () => 0),
            stop: 0
        };
        this.random = this.random.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.replay = this.replay.bind(this);
    }

    replay() {
        this.resultBoard.resetScore();
        this.setState({
            'stop': 0
        });
        this.state.data = Array.from(new Array(this.size), () => 0);
        this.forceUpdate();
        this.random();
        this.random();
    }

    componentDidMount() {
        this.initEvent();
    }

    random(count) {
        let occupied = [];
        let num = Math.random() > 0.3 ? 1 : 2;
        let index = parseInt(Math.random() * this.size);
        while (this.state.data[index] !== 0 && occupied.length < this.size) {
            index = parseInt(Math.random() * this.size);
            if (occupied.indexOf(index) === -1){
                occupied.push(index);
            }
        }
        if (occupied.length !== this.size) {
            this.state.data[index] = num;
            this.forceUpdate();
        }
    }

    initEvent() {
        let keyDirectionMap = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        document.onkeydown = e => {
            ga('send', 'event', 'keydown', 'playgame');
            this.handleAction(keyDirectionMap[event.keyCode]);
            e.preventDefault();
            e.stopPropagation();
        };

        let nStartX;
        let nStartY;

        let boardCnt = document.getElementById('playBoard');
        let body = document.body;
        boardCnt.addEventListener('touchstart', e => {
            nStartY = e.targetTouches[0].pageY;
            nStartX = e.targetTouches[0].pageX;
            e.preventDefault();
            e.stopPropagation();
        });
        boardCnt.addEventListener('touchend', e => {
            let nChangY = e.changedTouches[0].pageY;
            let nChangX = e.changedTouches[0].pageX;

            let xdistance = Math.pow(nStartX - nChangX, 2);
            let ydistance = Math.pow(nStartY - nChangY, 2);

            if (ydistance > 100 && xdistance / ydistance < 0.5) {
                if (nChangY > nStartY) {
                    this.handleAction('down');
                } else {
                    this.handleAction('up');
                }
            } else if (xdistance > 100 && ydistance / xdistance < 0.5) {
                if (nChangX > nStartX) {
                    this.handleAction('right');
                } else {
                    this.handleAction('left');
                }
            }
            ga('send', 'event', 'touch', 'playgame');
            e.preventDefault();
            e.stopPropagation();
        });
    }

    handleAction(direction, isCheck = 0) {
        if (this.state.stop) {
            return false;
        }
        let stack;
        let stackLen = 0;
        let addScore = 0;
        let isChange = 0;
        switch (direction) {
            case 'left':
                for (let i = 0; i <= this.size - this.width; i += this.width) {
                    stack = [];
                    stackLen = 0;
                    for (let j = 0; j < this.width; j++) {
                        if (this.state.data[i + j]) {
                            if (stackLen > 0 && stack[stackLen - 1] < 11 && stack[stackLen - 1] === this.state.data[i + j]) {
                                stack[stackLen - 1] += 1;
                                addScore += Math.pow(2, stack[stackLen - 1]);
                                if (stack[stackLen - 1] === 11) {
                                    this.winflag = true;
                                }
                            } else {
                                stack[stackLen++] = this.state.data[i + j];
                            }
                        }
                    }
                    for (let j = 0; j < this.width; j++) {
                        !isChange && (isChange = this.state.data[i + j] !== stack[j]);
                        if (isCheck && isChange) {
                            return true;
                        }
                        this.state.data[i + j] = stack[j] || 0;
                    }
                }
                break;
            case 'right':
                for (let i = this.width - 1; i < this.size; i += this.width) {
                    stack = [];
                    stackLen = 0;
                    for (let j = 0; j < this.width; j++) {
                        if (this.state.data[i - j]) {
                            if (stackLen > 0 && stack[stackLen - 1] < 11 && stack[stackLen - 1] === this.state.data[i - j]) {
                                stack[stackLen - 1] += 1;
                                addScore += Math.pow(2, stack[stackLen - 1]);
                                if (stack[stackLen - 1] === 11) {
                                    this.winflag = true;
                                }
                            } else {
                                stack[stackLen++] = this.state.data[i - j];
                            }
                        }
                    }
                    for (let j = 0; j < this.width; j++) {
                        !isChange && (isChange = this.state.data[i - j] !== stack[j]);
                        if (isCheck && isChange) {
                            return true;
                        }
                        this.state.data[i - j] = stack[j] || 0;
                    }
                }
                break;
            case 'up':
                for (let i = 0; i < this.width; i++) {
                    stack = [];
                    stackLen = 0;
                    for (let j = 0; j <= this.size - this.width; j += this.width) {
                        if (this.state.data[i + j]) {
                            if (stackLen > 0 && stack[stackLen - 1] < 11 && stack[stackLen - 1] === this.state.data[i + j]) {
                                stack[stackLen - 1] += 1;
                                addScore += Math.pow(2, stack[stackLen - 1]);
                                if (stack[stackLen - 1] === 11) {
                                    this.winflag = true;
                                }
                            } else {
                                stack[stackLen++] = this.state.data[i + j];
                            }
                        }
                    }
                    for (let j = 0; j < this.width; j++) {
                        !isChange
                            && (isChange = this.state.data[i + j * this.width] !== stack[j]);
                        if (isCheck && isChange) {
                            return true;
                        }
                        this.state.data[i + j * this.width] = stack[j] || 0;
                    }
                }
                break;
            case 'down':
                for (let i = this.size - this.width; i < this.size; i++) {
                    stack = [];
                    stackLen = 0;
                    for (let j = 0; j <= this.size - this.width; j += this.width) {
                        if (this.state.data[i - j]) {
                            if (stackLen > 0 && stack[stackLen - 1] < 11 && stack[stackLen - 1] === this.state.data[i - j]) {
                                stack[stackLen - 1] += 1;
                                addScore += Math.pow(2, stack[stackLen - 1]);
                                if (stack[stackLen - 1] === 11) {
                                    this.winflag = true;
                                }
                            } else {
                                stack[stackLen++] = this.state.data[i - j];
                            }
                        }
                    }
                    for (let j = 0; j < this.width; j++) {
                        !isChange
                            && (isChange = this.state.data[i - j * this.width] !== stack[j]);
                        if (isCheck && isChange) {
                            return true;
                        }
                        this.state.data[i - j * this.width] = stack[j] || 0;
                    }
                }
                break;
        }
        if (isCheck) {
            return false;
        }
        if (this.checkLose()) {
            this.loseGame();
        } else if (isChange) {
            this.random();
            this.resultBoard.addScore(addScore);
            if (this.winflag) {
                this.winGame();
            }
        }
    }

    checkLose() {
        let directions = ['left', 'right', 'up', 'down'];
        let hasNext = 1;
        let data = this.state.data;
        if (data.indexOf(0) === -1) {
            hasNext = 0;
            for (let i in directions) {
                let direction = directions[i];
                hasNext = this.handleAction(direction, 1);
                if (hasNext) {
                    break;
                }
            }
            this.setState({
                'data': data
            });
        }
        return !hasNext;
    }

    loseGame() {
        this.setState({
            'stop': 1
        });
        this.resultBoard.recordScore();
        ga('send', 'event', 'lose', this.state.score);
        alertPanel.show('Finaly you got ' + this.resultBoard.state.score);
    }
    winGame() {
        this.resultBoard.recordScore();
        ga('send', 'event', 'win', this.state.score);
        alertPanel.show('Good Job! You got 2048');
    }

    componentWillMount() {
        this.random();
        this.random();
    }

    render() {
        return <div>
            <div className="heading">
                <h1 className="title">2048</h1>
                <Result ref={ref => {
                    this.resultBoard = ref;
                }} />
                <div className="clearboth"></div>
                <div className="replayBtn" onClick={this.replay}>REPLAY</div>
            </div>
            <div className="board" id="playBoard">
            {this.state.data.map((item, i) => {
                return <Grid num={item} key={i}></Grid>;
            })}
            <div className="clearboth"></div>
        </div></div>;
    }
}

class Result extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'score': props.score || 0,
            'best': props.best || 0
        };
        this.resetScore = this.resetScore.bind(this);
        this.addScore = this.addScore.bind(this);
        this.recordScore = this.recordScore.bind(this);
    }

    resetScore(s) {
        let bestScore = this.state.best;
        let score = this.state.score;
        this.recordScore(() => {
            this.setState({
                'score': s || 0,
                'best': score > bestScore ? score : bestScore
            });
        });
    }

    addScore(s) {
        this.setState({
            moveUp: s || 0,
            addScore: s,
            score: this.state.score + s
        });
        setTimeout(() => {
            this.setState({
                moveUp: 0
            });
        }, 700);
    }

    recordScore(callback) {
        let that = this;
        let score = this.state.score > this.state.best
            ? this.state.score : this.state.best;
        MyFB.sendScore(score, callback);
    }

    render() {
        return <div className="scoresCnt">
            <div className="scoreCnt">{this.state.score}
                <div className={this.state.moveUp ? 'moveUp scoreAdd' : 'scoreAdd'}>
                    +{this.state.addScore || 0}
                </div>
            </div>
            <div className="bestCnt">{this.state.best}</div>
        </div>;
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.replay = this.replay.bind(this);
        this.replayTimes = 0;
    }

    replay() {
        this.board.replay();
        ga('send', 'event', 'click', 'replay', 'times', ++this.replayTimes);
    }

    componentDidMount() {
        let that = this;
        MyFB.init(alertPanel, {
            'setBestScore': score => {
                score = parseInt(score, 10);
                if (score) {
                    that.board.resultBoard.setState({
                        'best': score
                    });
                }
            }
        });
        // Feature detects Navigation Timing API support.
        if (window.performance) {
            // Gets the number of milliseconds since page load
            // (and rounds the result since the value must be an integer).
            let timeSincePageLoad = Math.round(performance.now());
            // Sends the timing hit to Google Analytics.
            ga('send', 'timing', 'JS Dependencies', 'load', timeSincePageLoad);
        }
    }
    render() {
        return <div>
            <LeaderBoard/>
            <Board ref={ref => {this.board = ref;}}></Board>
            <p className="desc">
                Move the tiles to make two tiles with the same number touch
                 and merge into one by using your arrow keys.
            </p>
            <AlertPanel ref={ref => {alertPanel = ref;}} />
        </div>;
    }
}
ReactDOM.render(
    <Main />,
    document.getElementById('main')
);