import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";

export default function SetupAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      if (userData) {
        // Usuário está logado, redireciona para onboarding
        navigate(createPageUrl("Onboarding"));
      } else {
        // Não está logado, redireciona para home
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  return null;
}