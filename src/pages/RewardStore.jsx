
import React, { useState, useEffect } from "react";
import { User as UserEntity } from "@/entities/User";
import { Reward } from "@/entities/Reward";
import { Purchase } from "@/entities/Purchase";
import { Trophy, ShoppingCart, Package, CheckCircle, Clock, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RewardStore() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      const rewardsList = await Reward.list();
      setRewards(rewardsList);

      const purchasesList = await Purchase.filter({ user_id: userData.id }, "-created_date");
      setPurchases(purchasesList);
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedReward || !deliveryAddress || purchasing) return;
    
    if (user.coins_balance < selectedReward.coin_cost) {
      alert("Moedas insuficientes!");
      return;
    }

    setPurchasing(true);
    try {
      await Purchase.create({
        user_id: user.id,
        reward_id: selectedReward.id,
        coin_cost: selectedReward.coin_cost,
        delivery_address: deliveryAddress,
        status: "processando"
      });

      await UserEntity.updateMyUserData({
        coins_balance: parseFloat((user.coins_balance - selectedReward.coin_cost).toFixed(2))
      });

      alert("Compra realizada com sucesso! Aguarde a entrega.");
      setSelectedReward(null);
      setDeliveryAddress("");
      loadData();
    } catch (error) {
      console.error("Erro ao comprar:", error);
      alert("Erro ao realizar compra. Tente novamente.");
    }
    setPurchasing(false);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      processando: { text: "Processando", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      enviado: { text: "Enviado", color: "bg-blue-100 text-blue-800", icon: Truck },
      entregue: { text: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle }
    };
    return statusMap[status] || statusMap.processando;
  };

  const getRewardName = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.name : "Produto";
  };

  if (loading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
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
    <div className="p-4 md:p-6 overflow-x-hidden">
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
          @media (max-width: 768px) {
            * {
              max-width: 100%;
            }
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-4 md:p-8 mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 flex-shrink-0" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Loja de Recompensas</h1>
              </div>
              <p className="text-sm md:text-base text-gray-600">
                Troque suas moedas por recompensas incríveis!
              </p>
              <p className="text-xs md:text-sm text-orange-600 font-medium mt-1">
                (Recompensas válidas apenas para alunos matriculados na Cultura Kid)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowPurchases(!showPurchases)}
                className={`neumorphic-button px-6 py-3 text-sm md:text-base font-medium flex items-center justify-center gap-2 ${
                  showPurchases ? "neumorphic-pressed text-blue-700" : "text-gray-800"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Minhas Compras
              </button>
              <div className="neumorphic-card p-4 text-center">
                <div className="text-2xl md:text-3xl mb-2">🪙</div>
                <h3 className="text-xl md:text-2xl font-bold text-orange-500">
                  {parseFloat(user?.coins_balance || 0).toFixed(2)}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">Suas Moedas</p>
              </div>
            </div>
          </div>
        </div>

        {showPurchases ? (
          <div className="neumorphic-card p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Histórico de Compras</h2>
              <button
                onClick={() => setShowPurchases(false)}
                className="neumorphic-button px-4 py-2 text-sm font-medium text-gray-800"
              >
                Voltar para Loja
              </button>
            </div>

            {purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => {
                  const statusInfo = getStatusInfo(purchase.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={purchase.id} className="neumorphic-card p-4 md:p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {getRewardName(purchase.reward_id)}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Endereço:</strong> {purchase.delivery_address}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Data da compra:</strong> {new Date(purchase.created_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-2 whitespace-nowrap`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.text}
                          </span>
                          <span className="text-lg font-bold text-orange-500">
                            🪙 {parseFloat(purchase.coin_cost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma compra realizada</h3>
                <p className="text-gray-600 mb-6">Você ainda não comprou nenhuma recompensa!</p>
                <button
                  onClick={() => setShowPurchases(false)}
                  className="neumorphic-button px-6 py-3 text-gray-800 font-medium"
                >
                  Ir para Loja
                </button>
              </div>
            )}
          </div>
        ) : selectedReward ? (
          <div className="neumorphic-card p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <img
                  src={selectedReward.image_url}
                  alt={selectedReward.name}
                  className="w-full h-48 md:h-64 object-cover rounded-xl mb-4"
                />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{selectedReward.name}</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4">{selectedReward.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl md:text-3xl">🪙</span>
                  <span className="text-xl md:text-2xl font-bold text-orange-500">
                    {parseFloat(selectedReward.coin_cost).toFixed(2)}
                  </span>
                  <span className="text-sm md:text-base text-gray-600">moedas</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Finalizar Compra</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Entrega
                  </label>
                  <Input
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Digite seu endereço completo"
                    className="neumorphic-input w-full p-3 md:p-4"
                  />
                </div>

                <div className="neumorphic-card p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-700">Custo:</span>
                    <span className="text-sm md:text-base font-bold text-orange-500">
                      🪙 {parseFloat(selectedReward.coin_cost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-700">Saldo Atual:</span>
                    <span className="text-sm md:text-base font-bold">
                      🪙 {parseFloat(user.coins_balance).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-400 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm md:text-base font-bold text-gray-800">Saldo Final:</span>
                      <span className={`text-sm md:text-base font-bold ${
                        user.coins_balance - selectedReward.coin_cost >= 0 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        🪙 {parseFloat(user.coins_balance - selectedReward.coin_cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setSelectedReward(null);
                      setDeliveryAddress("");
                    }}
                    className="neumorphic-button px-6 py-3 text-sm md:text-base text-gray-800 font-medium flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      purchasing || 
                      !deliveryAddress || 
                      user.coins_balance < selectedReward.coin_cost
                    }
                    className={`neumorphic-button px-6 py-3 text-sm md:text-base font-medium flex-1 ${
                      purchasing || !deliveryAddress || user.coins_balance < selectedReward.coin_cost
                        ? "opacity-50 cursor-not-allowed"
                        : "text-green-800"
                    }`}
                  >
                    {purchasing ? "Comprando..." : "Confirmar Compra"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="neumorphic-card p-4 md:p-6">
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="w-full h-40 md:h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 truncate">{reward.name}</h3>
                <p className="text-gray-600 mb-4 text-xs md:text-sm line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl md:text-2xl">🪙</span>
                    <span className="text-lg md:text-xl font-bold text-orange-500">
                      {parseFloat(reward.coin_cost).toFixed(2)}
                    </span>
                  </div>
                  {reward.in_stock ? (
                    <span className="text-xs md:text-sm text-green-600 flex items-center gap-1 whitespace-nowrap">
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      Em estoque
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm text-red-600 whitespace-nowrap">Esgotado</span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReward(reward)}
                  disabled={!reward.in_stock || user.coins_balance < reward.coin_cost}
                  className={`neumorphic-button w-full py-2 md:py-3 text-sm md:text-base font-medium ${
                    !reward.in_stock || user.coins_balance < reward.coin_cost
                      ? "opacity-50 cursor-not-allowed text-gray-600"
                      : "text-gray-800"
                  }`}
                >
                  {user.coins_balance < reward.coin_cost ? "Moedas Insuficientes" : "Comprar"}
                </button>
              </div>
            ))}

            {rewards.length === 0 && (
              <div className="col-span-full neumorphic-card p-8 md:p-12 text-center">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Nenhuma recompensa disponível</h3>
                <p className="text-sm md:text-base text-gray-600">Aguarde novos produtos na loja!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
