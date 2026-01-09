
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Gamepad2, Trophy, Zap, Lock, CheckCircle, BookOpen, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MiniGame() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [introduction, setIntroduction] = useState("");
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [dailyQuizzesRemaining, setDailyQuizzesRemaining] = useState(5);

  const englishTopics = [
    { topic: "Cores Básicas", vocabulary: "red, blue, green, yellow, black, white, purple, orange, pink, brown + Frases: I like this color, This is my favorite color, What color is this?", difficulty: "iniciante" },
    { topic: "Números 1-10", vocabulary: "one, two, three, four, five, six, seven, eight, nine, ten + Frases: I am [number] years old, I have [number] books", difficulty: "iniciante" },
    { topic: "Números 11-20", vocabulary: "eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty + Frases: I have [number] pencils, There are [number] students", difficulty: "iniciante" },
    { topic: "Família", vocabulary: "mother, father, sister, brother, grandmother, grandfather, aunt, uncle, cousin + Frases: I love my mother, This is my family, I have one brother", difficulty: "iniciante" },
    { topic: "Animais Domésticos", vocabulary: "dog, cat, bird, fish, hamster, rabbit, turtle, horse + Frases: I have a dog, My cat is cute, I love animals", difficulty: "iniciante" },
    { topic: "Partes do Corpo", vocabulary: "head, eyes, nose, mouth, ears, arms, hands, legs, feet + Frases: I have two eyes, My hands are clean, Touch your nose", difficulty: "iniciante" },
    { topic: "Roupas", vocabulary: "shirt, pants, dress, shoes, socks, hat, jacket, skirt + Frases: I'm wearing a blue shirt, Put on your shoes, I like your dress", difficulty: "iniciante" },
    { topic: "Comidas", vocabulary: "bread, rice, chicken, fish, apple, banana, orange, water, milk, juice + Frases: I like apples, This is delicious, I want water please", difficulty: "iniciante" },
    { topic: "Dias da Semana", vocabulary: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday + Frases: Today is Monday, See you on Friday, What day is today?", difficulty: "iniciante" },
    { topic: "Meses do Ano", vocabulary: "January, February, March, April, May, June, July, August, September, October, November, December + Frases: My birthday is in July, It's cold in January", difficulty: "iniciante" },
    { topic: "Casa - Cômodos", vocabulary: "kitchen, bedroom, bathroom, living room, garage, garden, balcony + Frases: I'm in the kitchen, Go to your bedroom, Where is the bathroom?", difficulty: "iniciante" },
    { topic: "Móveis", vocabulary: "table, chair, bed, sofa, desk, lamp, mirror, closet + Frases: Sit on the chair, My bed is comfortable, Turn on the lamp", difficulty: "iniciante" },
    { topic: "Escola - Objetos", vocabulary: "pencil, pen, eraser, ruler, book, notebook, backpack, scissors + Frases: I need a pencil, Open your book, Put it in your backpack", difficulty: "iniciante" },
    { topic: "Clima", vocabulary: "sunny, cloudy, rainy, windy, snowy, hot, cold, warm + Frases: It's sunny today, It's very cold, I like warm weather", difficulty: "iniciante" },
    { topic: "Estações do Ano", vocabulary: "spring, summer, fall/autumn, winter + Frases: I love summer, It's spring now, Winter is cold", difficulty: "iniciante" },
    { topic: "Frutas", vocabulary: "apple, banana, orange, grape, strawberry, watermelon, pineapple, mango + Frases: I eat an apple every day, Bananas are yellow, I love strawberries", difficulty: "iniciante" },
    { topic: "Vegetais", vocabulary: "carrot, tomato, lettuce, potato, onion, broccoli, cucumber, corn + Frases: Eat your vegetables, I like tomatoes, Carrots are healthy", difficulty: "iniciante" },
    { topic: "Bebidas", vocabulary: "water, juice, milk, soda, coffee, tea, hot chocolate + Frases: I drink water, Can I have juice?, I want hot chocolate", difficulty: "iniciante" },
    { topic: "Esportes", vocabulary: "soccer/football, basketball, volleyball, tennis, swimming, running, cycling + Frases: I play soccer, He likes basketball, Let's go swimming", difficulty: "iniciante" },
    { topic: "Cumprimentos", vocabulary: "hello, hi, goodbye, bye, good morning, good afternoon, good evening, good night + Frases: How are you?, Nice to meet you, See you later", difficulty: "iniciante" },
    { topic: "Cores Avançadas", vocabulary: "gray, silver, gold, beige, navy blue, light green, dark red + Frases: This color is beautiful, I prefer dark colors, Mix red and blue", difficulty: "intermediario" },
    { topic: "Profissões", vocabulary: "teacher, doctor, nurse, engineer, lawyer, chef, pilot, firefighter + Frases: I want to be a doctor, My mother is a teacher, He works as an engineer", difficulty: "intermediario" },
    { topic: "Cidade - Lugares", vocabulary: "bank, hospital, school, supermarket, restaurant, park, library, museum + Frases: Let's go to the park, Where is the hospital?, I study at school", difficulty: "intermediario" },
    { topic: "Transporte", vocabulary: "car, bus, train, airplane, bicycle, motorcycle, subway, taxi + Frases: I go by bus, Take a taxi, I ride my bicycle", difficulty: "intermediario" },
    { topic: "Instrumentos Musicais", vocabulary: "guitar, piano, drums, violin, flute, trumpet, saxophone + Frases: I play the guitar, She plays piano, He is learning drums", difficulty: "intermediario" },
    { topic: "Emoções", vocabulary: "happy, sad, angry, scared, surprised, excited, tired, bored + Frases: I am very happy, Don't be sad, I feel tired today", difficulty: "intermediario" },
    { topic: "Adjetivos - Tamanho", vocabulary: "big, small, large, tiny, huge, medium, enormous + Frases: This is too big, I want a small one, That's a huge elephant", difficulty: "intermediario" },
    { topic: "Adjetivos - Personalidade", vocabulary: "kind, friendly, smart, funny, shy, brave, honest, patient + Frases: She is very kind, He is a funny person, Be brave", difficulty: "intermediario" },
    { topic: "Animais Selvagens", vocabulary: "lion, elephant, giraffe, zebra, monkey, tiger, bear, wolf + Frases: Lions are strong, I saw an elephant, Monkeys are funny", difficulty: "intermediario" },
    { topic: "Animais Marinhos", vocabulary: "dolphin, whale, shark, octopus, seahorse, jellyfish, seal + Frases: Dolphins are smart, Whales are huge, I'm scared of sharks", difficulty: "intermediario" },
    { topic: "Insetos", vocabulary: "butterfly, bee, ant, spider, mosquito, fly, ladybug + Frases: Butterflies are beautiful, Bees make honey, I don't like spiders", difficulty: "intermediario" },
    { topic: "Natureza", vocabulary: "mountain, river, lake, ocean, forest, desert, beach, island + Frases: Let's go to the beach, The ocean is blue, I love the forest", difficulty: "intermediario" },
    { topic: "Plantas", vocabulary: "tree, flower, grass, rose, sunflower, cactus, leaf + Frases: Trees are green, I planted a flower, Roses are beautiful", difficulty: "intermediario" },
    { topic: "Tecnologia", vocabulary: "computer, phone, tablet, keyboard, mouse, screen, internet + Frases: I use my phone, Turn on the computer, Connect to the internet", difficulty: "intermediario" },
    { topic: "Hobbies", vocabulary: "reading, drawing, painting, dancing, singing, cooking, gardening + Frases: I love reading books, She enjoys painting, He likes cooking", difficulty: "intermediario" },
    { topic: "Números Grandes", vocabulary: "hundred, thousand, million, billion + Frases: One hundred people, Two thousand dollars, A million stars", difficulty: "intermediario" },
    { topic: "Tempo - Horas", vocabulary: "morning, afternoon, evening, night, midnight, noon + Frases: Good morning!, It's noon already, See you tonight", difficulty: "intermediario" },
    { topic: "Direções", vocabulary: "left, right, straight, north, south, east, west, up, down + Frases: Turn left, Go straight ahead, Look up", difficulty: "intermediario" },
    { topic: "Formas Geométricas", vocabulary: "circle, square, triangle, rectangle, star, heart, diamond + Frases: Draw a circle, This is a square, I see a star", difficulty: "intermediario" },
    { topic: "Materiais", vocabulary: "wood, metal, plastic, glass, paper, cotton, leather + Frases: It's made of wood, This is plastic, I need paper", difficulty: "intermediario" },
    { topic: "Expressões Cotidianas", vocabulary: "Thank you, You're welcome, Excuse me, I'm sorry, Please, Help me, I don't know, I understand + Frases: Can you help me?, I don't understand, Thank you very much", difficulty: "intermediario" },
    { topic: "Países", vocabulary: "Brazil, United States, England, France, Germany, Japan, China, Italy + Frases: I'm from Brazil, I want to visit Japan, She lives in France", difficulty: "avancado" },
    { topic: "Nacionalidades", vocabulary: "Brazilian, American, English, French, German, Japanese, Chinese, Italian + Frases: I am Brazilian, He is American, They are Japanese", difficulty: "avancado" },
    { topic: "Idiomas", vocabulary: "Portuguese, English, Spanish, French, German, Japanese, Chinese + Frases: I speak Portuguese, Do you speak English?, I'm learning Spanish", difficulty: "avancado" },
    { topic: "Universo", vocabulary: "sun, moon, star, planet, galaxy, comet, asteroid, satellite + Frases: The sun is bright, Look at the moon, There are many stars", difficulty: "avancado" },
    { topic: "Saúde", vocabulary: "medicine, hospital, doctor, nurse, patient, disease, treatment, vaccine + Frases: I need medicine, Go to the hospital, The doctor will help you", difficulty: "avancado" },
    { topic: "Economia", vocabulary: "money, bank, investment, profit, loss, budget, savings, loan + Frases: I need money, Save your money, Make an investment", difficulty: "avancado" },
    { topic: "Política", vocabulary: "president, government, election, vote, law, congress, senator, mayor + Frases: Vote for president, The government decides, Follow the law", difficulty: "avancado" },
    { topic: "Meio Ambiente", vocabulary: "pollution, recycling, environment, climate, renewable, energy, sustainability + Frases: Stop pollution, Recycle plastic, Protect the environment", difficulty: "avancado" },
    { topic: "Alimentos Avançados", vocabulary: "pasta, pizza, sushi, sandwich, salad, soup, dessert, appetizer + Frases: I love pizza, Let's eat sushi, This salad is fresh", difficulty: "avancado" },
    { topic: "Sentimentos Complexos", vocabulary: "anxious, jealous, grateful, proud, disappointed, frustrated, confident + Frases: I feel anxious, Don't be jealous, I'm so proud of you", difficulty: "avancado" },
    { topic: "Adjetivos de Qualidade", vocabulary: "excellent, terrible, amazing, awful, wonderful, horrible, fantastic + Frases: This is excellent!, That was amazing, It's a wonderful day", difficulty: "avancado" },
    { topic: "Verbos de Ação", vocabulary: "run, jump, swim, fly, climb, throw, catch, kick + Frases: I can run fast, Jump high, Let's go swimming", difficulty: "avancado" },
    { topic: "Verbos de Comunicação", vocabulary: "speak, talk, say, tell, ask, answer, explain, describe + Frases: Speak slowly please, Tell me a story, Can you explain this?", difficulty: "avancado" },
    { topic: "Verbos de Rotina", vocabulary: "wake up, get up, brush, shower, dress, eat, work, sleep + Frases: I wake up at 7, Brush your teeth, Time to sleep", difficulty: "avancado" },
    { topic: "Conectivos", vocabulary: "and, but, or, because, so, however, although, therefore + Frases: I like apples and bananas, It's cold but sunny, Do you want tea or coffee?", difficulty: "avancado" },
    { topic: "Preposições de Lugar", vocabulary: "in, on, at, under, above, below, between, behind, in front of + Frases: It's in the box, Put it on the table, Stand in front of me", difficulty: "avancado" },
    { topic: "Preposições de Tempo", vocabulary: "at, on, in, during, before, after, until, since + Frases: At 3 o'clock, On Monday, In the morning", difficulty: "avancado" },
    { topic: "Intensificadores", vocabulary: "very, really, quite, too, so, extremely, absolutely + Frases: It's very hot, I'm really tired, That's too expensive", difficulty: "avancado" },
    { topic: "Palavras de Frequência", vocabulary: "always, usually, often, sometimes, rarely, never, seldom + Frases: I always brush my teeth, I usually wake up early, I never lie", difficulty: "avancado" },
    { topic: "Expressões de Tempo", vocabulary: "yesterday, today, tomorrow, now, later, soon, already, yet + Frases: See you tomorrow, I'm busy now, I already ate", difficulty: "avancado" },
    { topic: "Quantificadores", vocabulary: "much, many, few, little, some, any, a lot of, plenty of + Frases: How much is it?, I have many friends, I need some help", difficulty: "avancado" },
    { topic: "Escritório", vocabulary: "desk, computer, meeting, presentation, project, deadline, colleague + Frases: I'm at my desk, We have a meeting, The deadline is tomorrow", difficulty: "avancado" },
    { topic: "Cinema & TV", vocabulary: "movie, film, actor, actress, director, scene, script, episode + Frases: Let's watch a movie, I like this actor, This scene is amazing", difficulty: "avancado" },
    { topic: "Culinária", vocabulary: "recipe, ingredient, oven, stove, bake, fry, boil, mix + Frases: Follow the recipe, Bake at 180 degrees, Mix the ingredients", difficulty: "avancado" },
    { topic: "Viagens", vocabulary: "airport, flight, passport, luggage, hotel, reservation, tourist + Frases: I'm at the airport, Check your passport, Book a hotel", difficulty: "avancado" },
    { topic: "Compras", vocabulary: "store, shop, buy, sell, price, discount, receipt, cashier + Frases: Let's go shopping, How much is the price?, I need a receipt", difficulty: "avancado" },
    { topic: "Internet", vocabulary: "website, email, password, download, upload, click, search, browser + Frases: I check my email, Enter your password, Download the file", difficulty: "avancado" },
    { topic: "Música", vocabulary: "song, singer, band, concert, album, lyrics, melody, rhythm + Frases: I love this song, The band is amazing, Let's go to a concert", difficulty: "avancado" },
    { topic: "Arte", vocabulary: "painting, sculpture, artist, gallery, museum, canvas, exhibition + Frases: This painting is beautiful, Visit the museum, The artist is talented", difficulty: "avancado" },
    { topic: "Literatura", vocabulary: "book, novel, story, author, character, chapter, plot, ending + Frases: I'm reading a book, This story is interesting, The ending was surprising", difficulty: "avancado" }
  ];

  const generateQuizzes = () => {
    return englishTopics.map((topicData, index) => ({
      id: index + 1,
      name: `Quiz ${index + 1}: ${topicData.topic}`,
      type: "ingles",
      difficulty: topicData.difficulty,
      level: index + 1,
      locked: index + 1 > 1,
      topicData: topicData
    }));
  };

  const loadUser = useCallback(async () => {
    try {
      const userData = await base44.auth.me();

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);

      if (userData.last_quiz_date !== today) {
        userData.daily_quizzes_count = 0;
        userData.last_quiz_date = today;
      }

      if (userData.last_activity_check !== today) {
        userData.daily_quiz_completed = false;
        userData.daily_investment_made = false;
      }

      if (userData.streak_month !== currentMonth) {
        userData.streak = 0;
        userData.streak_month = currentMonth;
      }
      
      setUser(userData);
      setStreak(userData.streak || 0);
      setDailyQuizzesRemaining(4 - (userData.daily_quizzes_count || 0));

      const allQuizzes = generateQuizzes();
      const unlockedLevel = ((userData.completed_quizzes || []).length) + 1;
      
      const updatedQuizzes = allQuizzes.map(quiz => ({
        ...quiz,
        locked: quiz.level > unlockedLevel,
        completed: (userData.completed_quizzes || []).includes(quiz.id)
      }));
      
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const generateIntroduction = async (quiz) => {
    try {
      const topicData = quiz.topicData;

      const intro = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie uma mini aula CURTA e DIRETA em PORTUGUÊS sobre o vocabulário de:

Tópico: ${topicData.topic}
Vocabulário-chave: ${topicData.vocabulary}

REGRAS IMPORTANTES:
1. Comece SEMPRE com: "Hello Kids! 👋 Preparados para o quiz sobre ${topicData.topic}?"
2. NUNCA use negrito (** ou __)
3. NUNCA use hashtags (#)
4. Seja CURTO - máximo 4-5 linhas de explicação.
5. Use 2-3 exemplos SIMPLES de frases usando as palavras do vocabulário, com tradução direta.
6. Use emojis.
7. SEM frases como "Vamos explorar", "É fascinante".

EXEMPLO DO QUE FAZER (para um tópico de vocabulário como "Animais Domésticos"):
"Hello Kids! 👋 Preparados para o quiz sobre Animais Domésticos?

Vamos aprender algumas palavras:
Um 'dog' é um cachorro 🐶. Exemplo: My dog is small (Meu cachorro é pequeno).
Um 'cat' é um gato 🐱. Exemplo: I love my cat (Eu amo meu gato).
Um 'bird' é um pássaro 🐦. Exemplo: The bird sings (O pássaro canta).

Fácil, né? 😊"

Agora crie uma mini aula similar para o vocabulário de: ${topicData.topic}
Lembre-se: CURTO, DIRETO e SEM NEGRITO!`
      });

      return intro;
    } catch (error) {
      console.error("Erro ao gerar introdução:", error);
      return `Hello Kids! 👋 Preparados para o quiz sobre ${quiz.topicData.topic}? Vamos lá! 🚀`;
    }
  };

  const generateQuestions = async (quiz) => {
    setGenerating(true);

    try {
      const intro = await generateIntroduction(quiz);
      setIntroduction(intro);
      setShowIntroduction(true);

      const topicData = quiz.topicData;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie 3 perguntas de TRADUÇÃO DIRETA de inglês para crianças sobre: ${topicData.topic}

Vocabulário: ${topicData.vocabulary}
Nível: ${quiz.difficulty}

⚠️ IMPORTANTE: Torne as perguntas MAIS SIMPLES do que o normal! Use o vocabulário e estruturas na parte MAIS FÁCIL de cada nível!

🎯 SIMPLICIDADE POR NÍVEL:

Se o nível é "iniciante":
- Vocabulário: Palavras MUITO básicas e comuns (dog, cat, red, blue, mom, dad)
- Frases: SUPER curtas, 2-4 palavras (ex: "I am happy", "This is red", "I love you")
- Gramática: Apenas presente simples, sem verbos compostos
- Exemplo: "Qual a tradução de 'dog' em português?"

Se o nível é "intermediario":
- Vocabulário: Palavras cotidianas simples (house, school, food, happy, play)
- Frases: Curtas e diretas, 4-6 palavras (ex: "I go to school", "She likes to read", "We play soccer")
- Gramática: Presente simples, verbos básicos, SEM present perfect complexo
- Exemplo: "Qual a tradução de 'I like pizza' em português?"

Se o nível é "avancado":
- Vocabulário: Palavras comuns mas um pouco mais ricas (beautiful, explain, different, important)
- Frases: Um pouco mais longas, 6-8 palavras (ex: "I want to be a doctor", "She can speak three languages")
- Gramática: Verbos modais simples (can, want, should), frases com "to" + verbo
- Exemplo: "Qual a tradução de 'I want to travel' em português?"

🚨 FORMATO ÚNICO PERMITIDO:

APENAS perguntas de tradução no formato:
"Qual a tradução de '[frase em inglês]' em português?"

🎯 REGRAS ABSOLUTAS:

1. FORMATO DA PERGUNTA (ÚNICO PERMITIDO):
   ✅ "Qual a tradução de 'I love my mother' em português?"
   ✅ "Qual a tradução de 'dog' em português?"
   ✅ "Qual a tradução de 'The sky is blue' em português?"
   
   ❌ NUNCA use "Complete: ___"
   ❌ NUNCA use "Como se diz..."
   ❌ NUNCA use "Qual frase..."
   ❌ APENAS "Qual a tradução de..."

2. RESPOSTAS:
   - Forneça a tradução correta em português
   - 2 traduções COMPLETAMENTE erradas (de outras frases/palavras)
   - As incorretas devem ser ÓBVIAS e não relacionadas
   
   ⚠️⚠️⚠️ CRÍTICO: NUNCA adicione símbolos como ✓, ✗, ☑, ✔, check marks, ou qualquer indicador visual nas opções de resposta!
   ⚠️⚠️⚠️ As opções devem ser APENAS o texto puro, sem símbolos!
   
   ERRADO: "Eu tenho um ano ✓"
   CERTO: "Eu tenho um ano"

3. EXEMPLOS PERFEITOS SIMPLIFICADOS:

   ✅ INICIANTE:
   Pergunta: "Qual a tradução de 'cat' em português?"
   A) gato
   B) cachorro
   C) pássaro

   ✅ INTERMEDIÁRIO:
   Pergunta: "Qual a tradução de 'I like apples' em português?"
   A) Eu gosto de maçãs
   B) Eu gosto de pizza
   C) Eu tenho um gato

   ✅ AVANÇADO:
   Pergunta: "Qual a tradução de 'She can swim' em português?"
   A) Ela sabe nadar
   B) Ela gosta de correr
   C) Ele joga futebol

4. CHECKLIST:
   - ✓ A pergunta é SIMPLES e DIRETA?
   - ✓ Uma criança entenderia facilmente?
   - ✓ As opções incorretas são ÓBVIAS?
   - ✓ Não há ambiguidade alguma?
   - ✓ NENHUMA opção tem símbolos (✓, ✗, etc)?

Crie exatamente 3 perguntas SIMPLES seguindo APENAS este formato!`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_index: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.questions && Array.isArray(response.questions)) {
        // Limpar qualquer símbolo que possa ter sido adicionado
        const cleanedQuestions = response.questions.map(q => ({
          ...q,
          options: q.options.map(opt => 
            opt.replace(/[✓✔☑✗✘☒]/g, '').trim()
          )
        }));
        setQuestions(cleanedQuestions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      setQuestions([]);
    }
    setGenerating(false);
  };

  const calculateLevelUp = (currentXP, addedXP) => {
    const totalXP = currentXP + addedXP;
    const newLevel = Math.floor(totalXP / 500) + 1;
    return newLevel;
  };

  const handleSelectQuiz = async (quiz) => {
    if (quiz.locked) return;
    
    if (dailyQuizzesRemaining <= 0) {
        alert("Você atingiu o limite de 4 quizzes por dia. Volte amanhã para fazer mais quizzes.");
        return;
    }

    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setIsCorrect(false);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowIntroduction(false);
    setAiMessages([]);
    setAiInput("");
    setAiLoading(false);
    setShowAiChat(false);
    await generateQuestions(quiz);
  };

  const handleStartQuiz = () => {
    setShowIntroduction(false);
  };

  const handleAnswer = async (index) => {
    if (showResult || selectedAnswer !== null || !questions[currentQuestion]) return;
    
    setSelectedAnswer(index);
    const question = questions[currentQuestion];
    const correct = index === question.correct_index;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 60;
    
    if (passed) {
      try {
        const coinsEarned = 10;
        const xpEarned = 50;
        
        const currentTotalXP = (user.xp_points || 0);
        const newXP = currentTotalXP + xpEarned;
        const newLevel = calculateLevelUp(currentTotalXP, xpEarned);
        
        let completedQuizzesArray = [...(user.completed_quizzes || [])];
        if (!completedQuizzesArray.includes(selectedQuiz.id)) {
          completedQuizzesArray.push(selectedQuiz.id);
        }

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().substring(0, 7);

        let updateData = {
          coins_balance: (user.coins_balance || 0) + coinsEarned,
          xp_points: newXP,
          level: newLevel,
          completed_quizzes: completedQuizzesArray,
          daily_quiz_completed: true,
          daily_quizzes_count: (user.daily_quizzes_count || 0) + 1,
          last_quiz_date: today,
          last_activity_check: today
        };

        // VERIFICAÇÃO CRÍTICA: Só aumentar foguinho se NUNCA aumentou hoje
        const lastStreakIncrease = user.last_streak_increase_date;
        const canIncreaseStreak = lastStreakIncrease !== today;
        
        let streakIncreasedToday = false;
        if (user.daily_investment_made && canIncreaseStreak) {
          updateData.streak = (user.streak || 0) + 1;
          updateData.streak_month = currentMonth;
          updateData.last_streak_increase_date = today;
          streakIncreasedToday = true;
        }

        await base44.auth.updateMe(updateData);

        const updatedUser = await base44.auth.me();
        setUser(updatedUser);
        setStreak(updatedUser.streak || 0);
        setDailyQuizzesRemaining(4 - (updatedUser.daily_quizzes_count || 0));

        let message = `🎉 Parabéns! +${coinsEarned} moedas e +${xpEarned} XP!`;
        message += `\n\nQuizzes restantes hoje: ${4 - (updatedUser.daily_quizzes_count || 0)}`;
        
        if (newLevel > (user.level || 1)) {
          message += `\n🎊 Você subiu para o nível ${newLevel}!`;
        }
        
        if (updatedUser.daily_quiz_completed && updatedUser.daily_investment_made && streakIncreasedToday) {
          message += `\n\n🔥 FOGUINHO AUMENTADO!`;
          message += `\n✅ Ambas tarefas completadas!`;
          message += `\n🔥 Seu foguinho agora é: ${updatedUser.streak} dias!`;
        } else if (updatedUser.daily_quiz_completed && !updatedUser.daily_investment_made) {
          message += `\n\n✅ Quiz completo! Falta: Investir 10+ moedas`;
          message += `\n💡 Complete hoje para ganhar +1 no foguinho! 🔥`;
        } else if (!canIncreaseStreak && updatedUser.daily_quiz_completed && updatedUser.daily_investment_made) {
          message += `\n\n✅ Quiz completo!`;
          message += `\n🔥 Você já ganhou seu foguinho hoje!`;
          message += `\n⏰ Volte amanhã para aumentar novamente!`;
        }
        
        if ((updatedUser.daily_quizzes_count || 0) >= 4) {
          message += `\n\n⚠️ Você atingiu o limite de 4 quizzes por dia!`;
          message += `\nVolte amanhã para fazer mais quizzes.`;
        }
        
        alert(message);
      } catch (error) {
        console.error("Erro ao atualizar recompensas:", error);
      }
    }
    
    setQuizCompleted(true);
    loadUser();
  };

  const handleAiQuestion = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userQuestion = aiInput;
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userQuestion }]);
    setAiLoading(true);

    try {
      const currentQ = questions[currentQuestion];
      const contextPrompt = `Você é o IA Kid do Banco Kids, um assistente educacional para crianças.

O aluno está fazendo um quiz sobre o vocabulário de: ${selectedQuiz.topicData.topic}
Vocabulário-chave: ${selectedQuiz.topicData.vocabulary}
Pergunta atual: ${currentQ?.question}

IMPORTANTE - REGRAS:
- NUNCA use negrito (** ou __) 
- NUNCA use hashtags (#)
- Seja MUITO breve e direto (máximo 2-3 linhas)
- Use emojis
- Explique de forma simples
- NÃO dê a resposta direta, apenas ajude a entender

Pergunta do aluno: ${userQuestion}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt
      });

      setAiMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Erro ao consultar IA:", error);
      setAiMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Ops! Tive um probleminha. Tenta de novo? 😅" 
      }]);
    }
    setAiLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    return difficulty === "iniciante" ? "bg-green-100 text-green-800" :
           difficulty === "intermediario" ? "bg-yellow-100 text-yellow-800" :
           "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 h-screen flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados. Recarregando...</p>
        </div>
      </div>
    );
  }

  if (selectedQuiz && !quizCompleted) {
    if (generating || questions.length === 0) {
      return (
        <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
          <div className="neumorphic-card p-8 md:p-12 text-center max-w-md">
            <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Preparando seu quiz...</p>
          </div>
        </div>
      );
    }

    if (showIntroduction) {
      return (
        <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
          <div className="neumorphic-card p-8 md:p-12 text-center max-w-2xl">
            <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{selectedQuiz.name}</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 whitespace-pre-wrap text-left">{introduction}</p>
            <button
              onClick={handleStartQuiz}
              className="neumorphic-button px-8 py-4 text-lg font-bold text-purple-700"
            >
              Começar Quiz! 🚀
            </button>
          </div>
        </div>
      );
    }

    const question = questions[currentQuestion];

    if (!question) {
      return (
        <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
          <div className="neumorphic-card p-8 md:p-12 text-center max-w-md">
            <p className="text-gray-600">Erro ao carregar pergunta. Tente novamente.</p>
            <button
              onClick={() => {
                setSelectedQuiz(null);
                setQuestions([]);
              }}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 min-h-screen">
        <style>
          {`
            .neumorphic-card {
              background: #e0e0e0;
              box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
              border-radius: 20px;
            }
            .neumorphic-button {
              background: #e0e0e0;
              box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
              border: none;
              border-radius: 15px;
              transition: all 0.2s ease;
            }
            .neumorphic-button:hover {
              box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
            }
            .neumorphic-button:active {
              box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            }
            .neumorphic-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .neumorphic-input {
              background: #e0e0e0;
              box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
              border: none;
              border-radius: 12px;
            }
          `}
        </style>

        <div className="max-w-3xl mx-auto">
          <div className="neumorphic-card p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedQuiz.name}</h2>
                <p className="text-sm md:text-base text-gray-600">Pergunta {currentQuestion + 1} de {questions.length}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuestions([]);
                  setShowIntroduction(false);
                  setAiMessages([]);
                  setShowAiChat(false);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="neumorphic-card p-4 md:p-8">
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4">{question.question}</h3>
            </div>

            <div className="grid gap-3 md:gap-4 mb-6">
              {question.options && question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult || selectedAnswer !== null}
                  className={`neumorphic-button p-4 md:p-6 text-left transition-all ${
                    showResult && index === question.correct_index
                      ? "bg-green-100 border-2 border-green-500"
                      : showResult && index === selectedAnswer && index !== question.correct_index
                      ? "bg-red-100 border-2 border-red-500"
                      : ""
                  } ${showResult || selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <p className="text-sm md:text-base font-medium text-gray-800">{option}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="neumorphic-card p-4 md:p-6 bg-purple-50 mb-6">
              {!showAiChat ? (
                <button
                  onClick={() => {
                    setShowAiChat(true);
                    if (aiMessages.length === 0) {
                      setAiMessages([{
                        role: "assistant",
                        content: "Hello! 👋 Sou a IA do Banco Kids. Pode me perguntar se você tiver alguma dúvida sobre esta questão! 😊"
                      }]);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 text-purple-700 font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Precisa de ajuda? Pergunte para a IA! 💡</span>
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-purple-800">IA do Banco Kids</h4>
                    </div>
                    <button
                      onClick={() => setShowAiChat(false)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-blue-100 text-blue-900 ml-8"
                            : "bg-white text-gray-800 mr-8"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="bg-white p-2 rounded-lg mr-8">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAiQuestion();
                        }
                      }}
                      placeholder="Digite sua dúvida..."
                      className="neumorphic-input flex-1 p-2 resize-none text-sm"
                      rows={2}
                    />
                    <button
                      onClick={handleAiQuestion}
                      disabled={!aiInput.trim() || aiLoading}
                      className={`neumorphic-button px-3 ${
                        !aiInput.trim() || aiLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Send className="w-4 h-4 text-gray-800" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showResult && (
              <div className={`neumorphic-card p-4 md:p-6 mb-6 ${
                isCorrect ? "bg-green-50" : "bg-red-50"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg md:text-xl font-bold text-green-800">Correto! 🎉</h3>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl md:text-3xl">😅</div>
                      <h3 className="text-lg md:text-xl font-bold text-red-800">Ops! Não foi dessa vez</h3>
                    </>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{question.explanation}</p>
              </div>
            )}

            {showResult && (
              <Button
                onClick={handleNextQuestion}
                className="w-full neumorphic-button py-4 md:py-6 text-base md:text-lg font-bold text-purple-700"
              >
                {currentQuestion < questions.length - 1 ? "Próxima Pergunta →" : "Ver Resultado 🎯"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 60;

    return (
      <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
        <div className="neumorphic-card p-6 md:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl md:text-8xl mb-6">{passed ? "🎉" : "📚"}</div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            {passed ? "Parabéns!" : "Continue Tentando!"}
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-6">
            Você acertou {score} de {questions.length} perguntas ({Math.round(percentage)}%)
          </p>
          
          {passed && (
            <div className="neumorphic-card p-4 md:p-6 mb-6 bg-green-50">
              <p className="text-base md:text-lg text-green-800 font-bold">
                +10 🪙 +50 ⭐
              </p>
              <p className="text-sm md:text-base text-green-700 mt-2">
                Próximo quiz desbloqueado! 🔓
              </p>
            </div>
          )}
          
          <button
            onClick={() => {
              setSelectedQuiz(null);
              setQuizCompleted(false);
              setQuestions([]);
              setShowIntroduction(false);
            }}
            className="neumorphic-button px-8 py-4 text-base md:text-lg font-bold text-purple-700"
          >
            Voltar aos Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <style>
        {`
          .neumorphic-card {
            background: #e0e0e0;
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            border-radius: 20px;
          }
          .neumorphic-button {
            background: #e0e0e0;
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
            border: none;
            border-radius: 15px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-4 md:p-8 mb-4 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-6 md:w-8 h-6 md:h-8 text-purple-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quizzes de Inglês</h1>
              <p className="text-sm md:text-base text-gray-600">70 níveis progressivos do básico ao avançado!</p>
            </div>
          </div>

          <div className="neumorphic-card p-4 md:p-6 bg-purple-50 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm md:text-base font-bold text-gray-800">
                  {(user.completed_quizzes || []).length} / 70 completos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-sm md:text-base font-bold text-gray-800">
                  Foguinho: {streak} dias
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {quizzes.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleSelectQuiz(quiz)}
              disabled={quiz.locked}
              className={`neumorphic-card p-4 md:p-6 text-center relative ${
                quiz.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              } transition-all`}
            >
              {quiz.locked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}
              
              {quiz.completed && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}
              
              <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-full flex items-center justify-center text-white font-bold ${
                quiz.difficulty === "iniciante" ? "bg-green-500" :
                quiz.difficulty === "intermediario" ? "bg-yellow-500" :
                "bg-red-500"
              }`}>
                {quiz.level}
              </div>
              
              <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-1">{quiz.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
