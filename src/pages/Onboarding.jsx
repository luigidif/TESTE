
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client"; // Updated import for base44
import { BookOpen, GraduationCap, School, Lock, CheckCircle, XCircle, User, Upload, Camera } from "lucide-react"; // Added User, Upload, Camera icons
import { Input } from "@/components/ui/input";

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // Start at step 0 for profile
  const [formData, setFormData] = useState({
    full_name: "", // Added full_name
    profile_picture: "", // Added profile_picture
    user_type: "",
    password: "",
    school: "",
    english_level: "",
    grade: ""
  });
  const [testQuestion, setTestQuestion] = useState("");
  const [testAnswer, setTestAnswer] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // Added state for photo upload

  const checkUser = useCallback(async () => {
    try {
      const userData = await base44.auth.me(); // Updated API call
      setUser(userData);
      
      if (userData.onboarding_completed) {
        navigate(createPageUrl("Dashboard"));
        return; // Exit early if onboarding is complete
      }
      
      // Pré-preencher dados existentes
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || "",
        profile_picture: userData.profile_picture || ""
      }));
      
      // Sempre começar no step 0 para novos usuários
      // (não pular mesmo que tenha full_name)
      setStep(0); // Ensure we always start at step 0 for onboarding, user will click continue
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file: file }); // Use base44 for upload
      setFormData({ ...formData, profile_picture: result.file_url });
      setError("");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setError("Erro ao fazer upload da foto. Tente novamente.");
    }
    setUploadingPhoto(false);
  };

  const handleProfileSubmit = async () => {
    if (!formData.full_name.trim()) {
      setError("Por favor, digite seu nome completo!");
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({ // Updated API call to base44.auth.updateMe
        full_name: formData.full_name.trim(),
        profile_picture: formData.profile_picture
      });
      setError("");
      setStep(1); // Go to user type selection (original step 1)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setError("Erro ao salvar. Tente novamente.");
    }
    setSaving(false);
  };

  const generateEnglishTest = async (level) => {
    const prompts = {
      iniciante: "Crie uma pergunta simples de inglês para iniciantes (ex: tradução de palavra básica, completar frase simples). Retorne apenas a pergunta, sem resposta.",
      intermediario: "Crie uma pergunta de inglês de nível intermediário (ex: uso de tempos verbais, phrasal verbs). Retorne apenas a pergunta, sem resposta.",
      avancado: "Crie uma pergunta desafiadora de inglês avançado (ex: interpretação de texto, gramática complexa). Retorne apenas a pergunta, sem resposta."
    };

    const question = await base44.integrations.Core.InvokeLLM({ // Updated API call
      prompt: prompts[level]
    });

    setTestQuestion(question);
  };

  const evaluateAnswer = async () => {
    setEvaluating(true);
    try {
      const evaluation = await base44.integrations.Core.InvokeLLM({ // Updated API call
        prompt: `Você é um professor de inglês. Avalie esta resposta do aluno:

Pergunta: ${testQuestion}
Resposta do aluno: ${testAnswer}

A resposta está correta ou razoável? Responda apenas 'CORRETO' ou 'INCORRETO' e explique brevemente.`,
        response_json_schema: {
          type: "object",
          properties: {
            result: { type: "string", enum: ["CORRETO", "INCORRETO"] },
            explanation: { type: "string" }
          }
        }
      });

      setTestResult(evaluation);
    } catch (error) {
      console.error("Erro ao avaliar:", error);
      setError("Erro ao avaliar resposta. Tente novamente.");
    }
    setEvaluating(false);
  };

  const handleTypeSelection = (type) => {
    setFormData({ ...formData, user_type: type });
    setError("");
    if (type === "professor") {
      setStep(2); // Pedir senha
    } else if (type === "estudante") {
      setStep(4); // Pular para nível de inglês
    }
  };

  const handlePasswordCheck = () => {
    if (formData.password === "000000") {
      setError("");
      setStep(3); // Perguntar escola (now step 3, previously step 2 from prev step 2)
    } else {
      setError("Senha incorreta! Acesso negado.");
    }
  };

  const handleLevelSelection = async (level) => {
    setFormData({ ...formData, english_level: level });
    setError("");
    await generateEnglishTest(level);
    setStep(5); // Ir para escola (now step 5, previously step 4 from prev step 4)
  };

  const handleSchoolSubmit = () => {
    if (!formData.school.trim()) {
      setError("Por favor, informe o nome da escola.");
      return;
    }
    setError("");
    
    if (formData.user_type === "professor") {
      completeOnboarding();
    } else {
      setStep(6); // Ir para teste de inglês (now step 6, previously step 5 from prev step 5)
    }
  };

  const handleTestSubmit = async () => {
    if (!testAnswer.trim()) {
      setError("Por favor, responda a pergunta.");
      return;
    }
    await evaluateAnswer();
  };

  const completeOnboarding = async () => {
    setSaving(true);
    try {
      const updateData = {
        user_type: formData.user_type,
        school: formData.school,
        onboarding_completed: true
      };

      // Only add english_level and grade if user is student
      if (formData.user_type === "estudante") {
        updateData.english_level = formData.english_level;
        updateData.coins_balance = 200; // Moedas iniciais
        if (formData.grade) {
          updateData.grade = formData.grade;
        }
      }

      await base44.auth.updateMe(updateData);
      
      // Se é estudante, criar entrada no ranking
      if (formData.user_type === "estudante") {
        const updatedUser = await base44.auth.me(); // Fetch updated user data to ensure all fields are current
        
        try {
          await base44.entities.RankingEntry.create({
            user_id: updatedUser.id,
            full_name: updatedUser.full_name || "Estudante",
            profile_picture: updatedUser.profile_picture || "",
            streak: 0,
            level: 1,
            coins_balance: 200, // Moedas iniciais
            last_updated: new Date().toISOString()
          });
        } catch (error) {
          console.error("Erro ao adicionar ao ranking:", error);
          // Decide if you want to set an error for the user or just log it
          // setError("Erro ao adicionar ao ranking, mas o cadastro foi concluído.");
        }
      }
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao finalizar cadastro:", error);
      setError("Erro ao finalizar cadastro. Tente novamente.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
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
          .neumorphic-input {
            background: #e0e0e0;
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            border: none;
            border-radius: 12px;
          }
          .neumorphic-pressed {
            background: #e0e0e0;
            box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff;
            border-radius: 15px;
          }
        `}
      </style>

      <div className="neumorphic-card p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b750ab8e991e96c91baa0b/edc1580f4_ApenasLogo.png" 
            alt="Banco Kids" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo ao Banco Kids!</h1>
          <p className="text-gray-600">Vamos configurar sua conta em alguns passos</p>
        </div>

        {/* Step 0: Nome e Foto de Perfil */}
        {step === 0 && (
          <div>
            <div className="text-center mb-6">
              <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Crie seu Perfil</h2>
              <p className="text-gray-600">Vamos começar com seu nome e foto</p>
            </div>

            <div className="space-y-6">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Foto de Perfil (opcional)
                </label>
                
                <div className="relative mb-4">
                  {formData.profile_picture ? (
                    <img 
                      src={formData.profile_picture} 
                      alt="Perfil" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-400"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-gray-300">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                    <Upload className="w-5 h-5" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>

                {uploadingPhoto && (
                  <p className="text-sm text-blue-600">Fazendo upload...</p>
                )}
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Digite seu nome completo"
                  className="neumorphic-input w-full p-4 text-lg"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleProfileSubmit}
                disabled={saving || uploadingPhoto}
                className={`neumorphic-button w-full py-4 font-medium text-lg ${
                  saving || uploadingPhoto ? "opacity-50 cursor-not-allowed" : "text-green-800"
                }`}
              >
                {saving ? "Salvando..." : "Continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Tipo de Usuário */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Você é estudante ou professor?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleTypeSelection("estudante")}
                className="neumorphic-button p-8 text-left"
              >
                <div className="text-5xl mb-4">👶</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Estudante</h3>
                <p className="text-gray-600 text-sm">Aprender inglês e ganhar moedas</p>
              </button>

              <button
                onClick={() => handleTypeSelection("professor")}
                className="neumorphic-button p-8 text-left"
              >
                <div className="text-5xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Professor</h3>
                <p className="text-gray-600 text-sm">Criar e corrigir exercícios</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Senha do Professor */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificação de Professor</h2>
              <p className="text-gray-600">Digite a senha de acesso para professores</p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Digite a senha"
                className="neumorphic-input w-full p-4 text-center text-2xl tracking-widest"
                maxLength={6}
              />

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="neumorphic-button px-6 py-3 text-gray-800 font-medium flex-1"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePasswordCheck}
                  disabled={!formData.password}
                  className={`neumorphic-button px-6 py-3 font-medium flex-1 ${
                    !formData.password ? "opacity-50 cursor-not-allowed" : "text-green-800"
                  }`}
                >
                  Verificar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Escola (Professor) */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <School className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Qual é sua escola?</h2>
              <p className="text-gray-600">Informe o nome da instituição onde você leciona</p>
            </div>

            <div className="space-y-4">
              <Input
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="Ex: Colégio Santa Maria"
                className="neumorphic-input w-full p-4"
              />

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleSchoolSubmit}
                disabled={saving}
                className={`neumorphic-button w-full py-4 font-medium ${
                  saving ? "opacity-50 cursor-not-allowed" : "text-green-800"
                }`}
              >
                {saving ? "Salvando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Nível de Inglês */}
        {step === 4 && (
          <div>
            <div className="text-center mb-6">
              <GraduationCap className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Qual seu nível de inglês?</h2>
              <p className="text-gray-600">Escolha o nível que melhor representa seu conhecimento</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleLevelSelection("iniciante")}
                className="neumorphic-button p-6 text-left"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">🌱 Iniciante</h3>
                <p className="text-gray-600 text-sm">Começando a aprender inglês</p>
              </button>

              <button
                onClick={() => handleLevelSelection("intermediario")}
                className="neumorphic-button p-6 text-left"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">📚 Intermediário</h3>
                <p className="text-gray-600 text-sm">Já sei o básico e quero avançar</p>
              </button>

              <button
                onClick={() => handleLevelSelection("avancado")}
                className="neumorphic-button p-6 text-left"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">🎓 Avançado</h3>
                <p className="text-gray-600 text-sm">Tenho domínio do inglês</p>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="neumorphic-button w-full py-3 text-gray-800 font-medium mt-6"
            >
              Voltar
            </button>
          </div>
        )}

        {/* Step 5: Escola e Série (Estudante) */}
        {step === 5 && (
          <div>
            <div className="text-center mb-6">
              <School className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Informações da Escola</h2>
              <p className="text-gray-600">Conte-nos sobre sua escola</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Escola
                </label>
                <Input
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="Ex: Colégio Santa Maria"
                  className="neumorphic-input w-full p-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Série/Ano (Opcional)
                </label>
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="Ex: 5º ano"
                  className="neumorphic-input w-full p-4"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleSchoolSubmit}
                className="neumorphic-button w-full py-4 font-medium text-green-800"
              >
                Próximo: Mini Teste
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Mini Teste de Inglês */}
        {step === 6 && !testResult && (
          <div>
            <div className="text-center mb-6">
              <BookOpen className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Mini Teste de Inglês</h2>
              <p className="text-gray-600">Vamos ver como está seu inglês! 📝</p>
            </div>

            <div className="neumorphic-card p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Pergunta:</h3>
              <p className="text-gray-700 text-lg">{testQuestion}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Resposta
                </label>
                <textarea
                  value={testAnswer}
                  onChange={(e) => setTestAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="neumorphic-input w-full p-4 min-h-32 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleTestSubmit}
                disabled={evaluating}
                className={`neumorphic-button w-full py-4 font-medium ${
                  evaluating ? "opacity-50 cursor-not-allowed" : "text-green-800"
                }`}
              >
                {evaluating ? "Avaliando..." : "Enviar Resposta"}
              </button>
            </div>
          </div>
        )}

        {/* Step 6b: Resultado do Teste */}
        {step === 6 && testResult && (
          <div>
            <div className="text-center mb-6">
              {testResult.result === "CORRETO" ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Parabéns! 🎉</h2>
                </>
              ) : (
                <>
                  <BookOpen className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-orange-600 mb-2">Bom esforço! 💪</h2>
                </>
              )}
              <p className="text-gray-600">Aqui está o feedback:</p>
            </div>

            <div className="neumorphic-card p-6 mb-6">
              <p className="text-gray-700">{testResult.explanation}</p>
            </div>

            <button
              onClick={completeOnboarding}
              disabled={saving}
              className={`neumorphic-button w-full py-4 font-medium ${
                saving ? "opacity-50 cursor-not-allowed" : "text-green-800"
              }`}
            >
              {saving ? "Finalizando..." : "Começar a Usar o Banco Kids! 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
