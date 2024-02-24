import { View, Text, Image } from 'react-native'
import React from 'react'

const QuotesComponent = () => {

    const quotes = [
        "Your body can stand almost anything. It's your mind that you have to convince.",
        "Pain is temporary. Quitting lasts forever.",
        "The difference between try and triumph is a little 'umph'.",
        "Every workout is progress.",
        "Sweat is just fat crying.",
        "No pain, no gain.",
        "If it doesn’t challenge you, it doesn’t change you.",
        "Success starts with self-discipline.",
        "Strength does not come from the physical capacity. It comes from an indomitable will.",
        "Get comfortable with being uncomfortable.",
        "Fall in love with taking care of your body.",
        "Push yourself because no one else is going to do it for you.",
        "Results happen over time, not overnight. Work hard, stay consistent, and be patient.",
        "Don't wish for a good body, work for it.",
        "If you still look good at the end of your workout, you didn’t train hard enough.",
        "When you feel like quitting, think about why you started.",
        "Fitness is not about being better than someone else. It's about being better than you used to be.",
        "Slow progress is better than no progress.",
        "Don't count the days, make the days count.",
        "You are so much stronger than you think.",
        "The body achieves what the mind believes.",
        "Fitness is not a destination. It's a journey.",
        "The hardest lift of all is lifting your butt off the couch.",
        "Make yourself proud.",
        "Suffer the pain of discipline or suffer the pain of regret.",
        "It never gets easier, you just get stronger.",
        "Your only limit is you.",
        "You don't have to be great to start, but you have to start to be great.",
        "Respect your body. It's the only one you get.",
        "Hard work beats talent when talent doesn't work hard.",
        "Conquer yourself and the world lies at your feet.",
        "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
        "It’s not about having time. It's about making time.",
        "What hurts today makes you stronger tomorrow.",
        "Do something today that your future self will thank you for.",
        "The only limits you have are the limits you believe.",
        "Whether you think you can or think you can't, you're right.",
        "Your mind gives up before your legs do.",
        "The only bad workout is the one you didn't do.",
        "The beginning is always tough. But once you're in it, you become unstoppable.",
        "It's a slow process, but quitting won't speed it up.",
        "Success isn't always about greatness. It's about consistency.",
        "Nothing truly great ever came from a comfort zone.",
        "To change your body, you must first change your mind.",
        "Wake up with determination. Go to bed with satisfaction.",
        "Strong is what happens when you run out of weak.",
        "Never give up on a dream just because of the time it will take to accomplish it.",
        "A one-hour workout is just 4% of your day.",
        "Exercise is therapy.",
        "You have a choice. You can throw in the towel or use it to wipe the sweat off your face.",
        "Lack of activity destroys the good condition of every human being.",
        "Strive for progress, not perfection.",
        "If you're tired of starting over, stop giving up.",
        "Work hard in silence. Let success be your noise.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Every champion was once a contender that refused to give up.",
        "Push yourself to your limits. That’s how you truly grow.",
        "Don't limit your challenges, challenge your limits.",
        "You don't get what you wish for. You get what you work for.",
        "Doubt kills more dreams than failure ever will.",
        "The best project you'll ever work on is you.",
        "Believe you can and you're halfway there.",
        "Run when you can, walk if you have to, crawl if you must; just never give up.",
        "Believe in yourself and all that you are.",
        "Work out. Eat well. Be patient. Your body will reward you.",
        "Stop waiting for things to happen. Go out and make them happen.",
        "A journey of a thousand miles begins with a single step.",
        "Pain is temporary. Glory is forever.",
        "Challenges are what make life interesting. Overcoming them is what makes life meaningful.",
        "If you think lifting is dangerous, try being weak. Being weak is dangerous.",
        "What's important is to get into shape and then not to have to worry about it. I don't want to get on stage and not be able",
        "Every rep brings you one step closer to your goal.",
        "Don’t limit your challenges; challenge your limits.",
        "Strength grows in the moments when you think you can’t go on but you keep going anyway.",
        "Fitness isn’t a season; it’s a lifestyle.",
        "You don’t have to go fast, you just have to go.",
        "The only bad workout is the one that didn’t happen.",
        "The body achieves what the mind believes.",
        "Don't wait for opportunity. Create it.",
        "Discipline is choosing between what you want now and what you want most.",
        "The pain of today is the victory of tomorrow.",
        "Your potential is endless.",
        "Be stronger than your strongest excuse.",
        "Don’t count the days. Make the days count.",
        "Start where you are. Use what you have. Do what you can.",
        "You’re only one workout away from a good mood.",
        "Progress, not perfection.",
        "You can’t stop waves, but you can learn to surf.",
        "Fitness is like a relationship. You can’t cheat and expect it to work.",
        "Your only competition is who you were yesterday.",
        "It's not about how bad you want it. It's about how hard you're willing to work for it.",
        "Every mile begins with a single step.",
        "Embrace the soreness. It's a sign of progress.",
        "The only time you should ever look back is to see how far you've come.",
        "Set goals. Stay quiet about them. Smash the hell out of them.",
        "Today's sweat is tomorrow's strength.",
        "Your comfort zone is a beautiful place, but nothing ever grows there.",
        "The body is the servant of the mind.",
        "Consistency is what transforms average into excellence.",
        "You didn’t come this far to only come this far.",
        "Fitness is like marriage. You can’t cheat on it and expect it to work.",
        "You are the creator of your own destiny.",
        "The only limit to your impact is your imagination and commitment.",
        "Keep your squats low and your standards high.",
        "You miss 100% of the shots you don’t take.",
        "The best time to start was yesterday. The next best time is now.",
        "Don’t fear moving slowly forward...fear standing still.",
        "Be the energy you want to attract.",
        "When it burns, you’re getting closer.",
        "Rome wasn’t built in a day, but they worked on it every single day.",
        "Change is not a matter of possibility; it’s a matter of decision.",
        "If you're waiting for a sign, this is it.",
        "Commitment is pushing yourself when no one else is around.",
        "Your desire to change must be greater than your desire to stay the same.",
        "It’s not about perfect. It’s about effort.",
        "Great things never came from comfort zones.",
        "Your only limit is the one you set yourself.",
        "You can have results or excuses, not both.",
        "Strength is earned, not given.",
        "Believe in yourself, push your limits, and do whatever it takes to conquer your goals.",
        "The only bad workout is the one that didn’t happen."
    ]

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
        <View className='bg-card-bg mx-4 my-2 rounded-2xl'>
            <View className='mx-2 my-4'>
                {/* <View className="flex-row">
                    <Image
                        source={require("../../constants/icons/box.png")}
                        resizeMode="contain"
                        style={{
                            height: 20,
                            width: 20,
                        }}
                    />
                    <Text className='text-white text-base mb-2'>Motivation</Text>
                </View> */}

                <Text className='text-white text-center'>{randomQuote}</Text>
            </View>
        </View>
    )
}

export default QuotesComponent