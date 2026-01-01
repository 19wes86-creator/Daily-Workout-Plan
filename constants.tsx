
import { Exercise } from './types';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'e1',
    name: 'Glute Bridges',
    description: 'Lie on your back with knees bent and feet flat on the floor. Lift your hips until your body forms a straight line from shoulders to knees.',
    targetArea: 'glutes',
    image: 'https://picsum.photos/seed/glutebridge/600/400',
    reps: '15-20 reps',
    sets: 3,
    tips: ['Squeeze glutes at the top', 'Don’t arch your lower back', 'Keep feet hip-width apart']
  },
  {
    id: 'e2',
    name: 'Clamshells',
    description: 'Lie on your side with hips and knees bent. Keep your feet together and lift your top knee as high as possible without shifting your hips.',
    targetArea: 'hips',
    image: 'https://picsum.photos/seed/clamshell/600/400',
    reps: '15 reps per side',
    sets: 3,
    tips: ['Keep your back straight', 'Focus on the lateral hip muscle', 'Don’t roll your pelvis backwards']
  },
  {
    id: 'e3',
    name: 'Single-Leg Deadlifts',
    description: 'Balance on one leg, hinge at the hips while lowering your torso and extending the other leg behind you. Return to standing.',
    targetArea: 'balance',
    image: 'https://picsum.photos/seed/deadlift/600/400',
    reps: '10 reps per side',
    sets: 3,
    tips: ['Keep your core tight', 'Maintain a slight bend in the standing knee', 'Focus on a point ahead for balance']
  },
  {
    id: 'e4',
    name: 'Bulgarian Split Squats',
    description: 'Place one foot on a bench behind you. Lower into a lunge until your back knee almost touches the floor.',
    targetArea: 'legs',
    image: 'https://picsum.photos/seed/lunge/600/400',
    reps: '12 reps per side',
    sets: 3,
    tips: ['Keep front knee behind toes', 'Maintain upright posture', 'Control the descent']
  },
  {
    id: 'e5',
    name: 'Monster Walks',
    description: 'With a resistance band around your ankles, take wide steps forward and sideways in a semi-squat position.',
    targetArea: 'hips',
    image: 'https://picsum.photos/seed/walk/600/400',
    reps: '20 steps each direction',
    sets: 3,
    tips: ['Keep tension on the band', 'Don’t let knees cave in', 'Stay low in the squat']
  },
  {
    id: 'e6',
    name: 'Dead Bug',
    description: 'Lie on your back, arms reaching up. Lower opposite arm and leg simultaneously while keeping your lower back pressed to the floor.',
    targetArea: 'core',
    image: 'https://picsum.photos/seed/core/600/400',
    reps: '10 reps per side',
    sets: 3,
    tips: ['Lower back must stay flat', 'Move slowly and with control', 'Exhale as you extend']
  }
];
