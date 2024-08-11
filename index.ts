import * as w3 from '@solana/web3.js'
// import * as dotenv from 'dotenv'
// import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { SECRET_KEY, TREASURY_KEY } from './key'
import { getWalletBalance, transferSOL, airDrop, getReturnAmount, randomNumber, totalAmountToBePaid } from './helpers'
import chalk from 'chalk'
import inquirer from 'inquirer'
import figlet from 'figlet'

// dotenv.config()

// const userWallet = w3.Keypair.generate()
// console.log(userWallet.secretKey)

// const key_in_bs58 = base58.encode(userWallet.secretKey)
// console.log(key_in_bs58)
// console.log(userWallet.publicKey.toBase58()) --> get the public key to airdrop some SOL


const userWallet = w3.Keypair.fromSecretKey(Uint8Array.from(SECRET_KEY))
// console.log(userWallet.publicKey.toBase58())
const treasuryWallet = w3.Keypair.fromSecretKey(Uint8Array.from(TREASURY_KEY))

const init = () => {
    console.log(
        chalk.greenBright(
            figlet.textSync("SOL  ROULETTE", {
                font : "small",
                horizontalLayout : "default",
                verticalLayout : "default"
            })
        )
    )
    console.log(chalk.red`The maximum bidding amount is 5 SOL`)
}

const askQuestions = () => {
    const questions = [{
        name : "SOL",
        type : "number",
        message : "What is the amount of SOL you want to stake?"
    },
    {
        name : "RATIO",
        type : "rawlist",
        message : "What is the ratio of your staking?",
        choices : ["1:1.25", "1:1.5", "1:1.75", "1:2"],
    },
    {
        name : "RANDOM",
        type : "list",
        message : "Guess a number from 1 to 5(both included)",
        choices : [1,2,3,4,5],
        when : async (val) => {
            if(Number.isNaN(parseFloat(totalAmountToBePaid(val.SOL))) || parseFloat(totalAmountToBePaid(val.SOL)) <= 0){
                console.log()
                console.log(chalk.red`You can't play with no SOL staked!`)
                return false;
            }
            else if(val.SOL > 5){
                console.log()
                console.log(chalk.red`Please stake with a smaller amount.`)
                return false;
            }
            else {
                const amount = await totalAmountToBePaid(val.SOL)
                console.log(`You need to pay ${chalk.yellowBright(amount)} SOL (including platform charges)`)
                const userBalance = await getWalletBalance(userWallet.publicKey.toString())
                // @ts-ignore
                if(userBalance < totalAmountToBePaid(val.SOL)){
                    console.log(chalk.red`You don't have enough balance in your wallet`)
                    return false;
                }
                else {
                    const ratioValue = parseFloat(val.RATIO.split(':')[1])
                    const returnAmount = getReturnAmount(val.SOL, ratioValue);
                    console.log(`You will get ${chalk.green(returnAmount)} SOL if your guess is correct`)
                    return true;
                }
            }
        },
    }]
    // @ts-ignore
    return inquirer.prompt(questions)
}

const Game = async () => {
    init()
    const generatedRandomNumber = randomNumber(1,5)
    const answers = await askQuestions()

    if(answers.RANDOM) {
        const paymentSignature = await transferSOL(userWallet, treasuryWallet, totalAmountToBePaid(answers.SOL))
        console.log(`Signature of the payment : ${chalk.green(paymentSignature)}`)

        if(answers.RANDOM === generatedRandomNumber) {
            await airDrop(treasuryWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)))
            const prizeSignature = await transferSOL(treasuryWallet, userWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO.split(':')[1])))
            console.log(chalk.green`Congratulations! Your guess was correct`)
            console.log(`Prize signature : ${chalk.green(prizeSignature)}`)
        }
        else {
            console.log()
            console.log(chalk.yellow`Better luck next time`)
        }
    }
}

Game()