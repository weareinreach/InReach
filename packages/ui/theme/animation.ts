import { rem } from '@mantine/core'

export const shake = {
	'@keyframes shake1': {
		'0%': { marginLeft: `0rem` },
		'25%': { marginLeft: `0.5rem` },
		'75%': { marginLeft: `-0.5rem` },
		'100%': { marginLeft: `0rem` },
	},
	'@keyframes shake2': {
		'0%': { transform: `translate(${rem(1)}, ${rem(1)}) rotate(0deg)` },
		'10%': { transform: `translate(${rem(-1)}, ${rem(-2)}) rotate(-1deg)` },
		'20%': { transform: `translate(${rem(-3)}, ${rem(0)}) rotate(1deg)` },
		'30%': { transform: `translate(${rem(3)}, ${rem(2)}) rotate(0deg)` },
		'40%': { transform: `translate(${rem(1)}, ${rem(-1)}) rotate(1deg)` },
		'50%': { transform: `translate(${rem(-1)}, ${rem(2)}) rotate(-1deg)` },
		'60%': { transform: `translate(${rem(-3)}, ${rem(1)}) rotate(0deg)` },
		'70%': { transform: `translate(${rem(3)}, ${rem(1)}) rotate(-1deg)` },
		'80%': { transform: `translate(${rem(-1)}, ${rem(-1)}) rotate(1deg)` },
		'90%': { transform: `translate(${rem(1)}, ${rem(2)}) rotate(0deg)` },
		'100%': { transform: `translate(${rem(1)}, ${rem(-2)}) rotate(-1deg)` },
	},
	'@keyframes shake3': {
		'0%': { transform: `translate(${rem(1)}, ${rem(1)}) rotate(0deg)` },
		'20%': { transform: `translate(${rem(-3)}, ${rem(0)}) rotate(1deg)` },
		'40%': { transform: `translate(${rem(1)}, ${rem(-1)}) rotate(1deg)` },
		'60%': { transform: `translate(${rem(-3)}, ${rem(1)}) rotate(0deg)` },
		'90%': { transform: `translate(${rem(1)}, ${rem(2)}) rotate(0deg)` },
		'100%': { transform: `translate(${rem(1)}, ${rem(-2)}) rotate(-1deg)` },
	},
	'@keyframes shake4': {
		'0%, 100%': { transform: `translateX(0)` },
		'10%, 30%, 50%, 70%, 90%': { transform: `translateX(${rem(-10)})` },
		'20%, 40%, 60%, 80%': { transform: `translateX(${rem(10)})` },
	},
	'@keyframes shake5': {
		'0%': { transform: `rotate(0deg)` },
		'25%': { transform: `rotate(5deg)` },
		'50%': { transform: `rotate(0eg)` },
		'75%': { transform: `rotate(-5deg)` },
		'100%': { transform: `rotate(0deg)` },
	},
	'@keyframes shake6': {
		'0%': { transform: `translateX(0)` },
		'25%': { transform: `translateX(${rem(5)})` },
		'50%': { transform: `translateX(${rem(-5)})` },
		'75%': { transform: `translateX(${rem(5)})` },
		'100%': { transform: `translateX(0)` },
	},
	'@keyframes shake7': {
		'0%': { transform: `translate(0, 0) rotate(0deg)` },
		'25%': { transform: `translate(${rem(5)}, ${rem(5)}) rotate(5deg)` },
		'50%': { transform: `translate(0, 0) rotate(0eg)` },
		'75%': { transform: `translate(${rem(-5)}, ${rem(5)}) rotate(-5deg)` },
		'100%': { transform: `translate(0, 0) rotate(0deg)` },
	},
}
