import one from '../images/upgrades/1.png';
import two from '../images/upgrades/2.png';
import three from '../images/upgrades/3.png';
import four from '../images/upgrades/4.png';
import five from '../images/upgrades/5.png';
import six from '../images/upgrades/6.png';
import seven from '../images/upgrades/7.png';
import eight from '../images/upgrades/8.png';

export interface UpgradeItem {
  image: string;
  header: string;
  description: string;
  price: string;
  premium: boolean;
  color?: string;
}

export const upgrades: UpgradeItem[] = [
  {
    image: one,
    header: 'Remove false answers',
    description: 'Removes at least two false alternatives.',
    color: 'from-blue-500/20 to-cyan-500/20',
    price: '200 points',
    premium: false,
  },
  {
    image: two,
    header: 'Full point score',
    description: 'Get full score when choosing the correct alternative, like a clock reset.',
    color: 'from-yellow-500/20 to-orange-500/20',
    price: '250 points',
    premium: false,
  },
  {
    image: three,
    header: 'Gear up your score',
    description: 'Score multiplier that increases the amount of points you earn per question.',
    color: 'from-purple-500/20 to-pink-500/20',
    price: '100 points',
    premium: false,
  },
  {
    image: four,
    header: 'Eye in the sky',
    description: 'See what your opponents are answering in real time.',
    color: 'from-green-500/20 to-emerald-500/20',
    price: '300 points',
    premium: false,
  },
  {
    image: five,
    header: 'Shield protection',
    description: 'Protects you from sabotage from other players.',
    color: 'from-indigo-500/20 to-blue-500/20',
    price: '500 points',
    premium: true,
  },
  {
    image: six,
    header: 'Slow down',
    description: 'Sabotages your opponents by slowing down their games.',
    color: 'from-red-500/20 to-pink-500/20',
    price: '1 000 points',
    premium: true,
  },
  {
    image: seven,
    header: 'End an opponent',
    description: "Sabotage one opponent by taking away their entire score.",
    color: 'from-purple-500/20 to-red-500/20',
    price: '2 000 points',
    premium: true,
  },
  {
    image: eight,
    header: 'Nuke',
    description: "Sabotage the entire game by taking away everyone's score!",
    color: 'from-red-500/20 to-orange-500/20',
    price: '10 000 points',
    premium: true,
  },
];

export default upgrades;

