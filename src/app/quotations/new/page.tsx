"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, NumberInput, Select } from "@/once-ui/components";
import axios from "axios";

const NewQuotationForm: React.FC = () => {
  const [buyers, setBuyers] = useState<{ id: number; name: string }[]>([]);
  const [orderProfiles, setOrderProfiles] = useState<{ id: number; name: string }[]>([]);
  const [buyerId, setBuyerId] = useState<number | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [poNumber, setPoNumber] = useState("");
  const [finishSizeWidth, setFinishSizeWidth] = useState(0);
  const [finishSizeHeight, setFinishSizeHeight] = useState(0);
  const [turningRate, setTurningRate] = useState(0);
  const [teethCount, setTeethCount] = useState(0);
  const [module, setModule] = useState(0);
  const [face, setFace] = useState(0);
  const [weight, setWeight] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [tcTgPrice, setTcTgPrice] = useState(0);
  const [htCost, setHtCost] = useState(0);
  const [processCosts, setProcessCosts] = useState<Record<string, number>>({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [totalOrderValue, setTotalOrderValue] = useState(0);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await axios.get("/api/buyers");
        setBuyers(response.data.buyers);
      } catch (error) {
        console.error("Error fetching buyers:", error);
      }
    };

    const fetchOrderProfiles = async () => {
      try {
        const response = await axios.get("/api/order-profiles");
        setOrderProfiles(response.data.orderProfiles);
      } catch (error) {
        console.error("Error fetching order profiles:", error);
      }
    };

    fetchBuyers();
    fetchOrderProfiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/quotations", {
        purchaserId: buyerId,
        poNumber,
        profileId,
        finishSizeWidth,
        finishSizeHeight,
        turningRate,
        teethCount,
        module,
        face,
        weight,
        materialCost,
        tcTgPrice,
        htCost,
        processCosts,
        grandTotal,
        profitMargin,
        totalOrderValue,
      });
      if (response.status === 200) {
        alert("Quotation added successfully");
        setBuyerId(null);
        setProfileId(null);
        setPoNumber("");
        setFinishSizeWidth(0);
        setFinishSizeHeight(0);
        setTurningRate(0);
        setTeethCount(0);
        setModule(0);
        setFace(0);
        setWeight(0);
        setMaterialCost(0);
        setTcTgPrice(0);
        setHtCost(0);
        setProcessCosts({});
        setGrandTotal(0);
        setProfitMargin(0);
        setTotalOrderValue(0);
      }
    } catch (error) {
      console.error("Error adding quotation:", error);
      alert("Failed to add quotation");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select
        value={buyerId?.toString() || ""}
        onSelect={(value) => setBuyerId(Number(value))}
        required
        id="buyerId"
        label="Buyer"
        options={buyers.map((buyer) => ({
          value: buyer.id.toString(),
          label: buyer.name,
        }))}
      />
      <Select
        value={profileId?.toString() || ""}
        onSelect={(value) => setProfileId(Number(value))}
        required
        id="profileId"
        label="Order Profile"
        options={orderProfiles.map((profile) => ({
          value: profile.id.toString(),
          label: profile.name,
        }))}
      />
      <Input
        value={poNumber}
        onChange={(e) => setPoNumber(e.target.value)}
        required
        id="poNumber"
        label="PO Number"
      />
      <NumberInput
        value={finishSizeWidth}
        onChange={(value) => setFinishSizeWidth(value)}
        required
        id="finishSizeWidth"
        label="Finish Size Width"
      />
      <NumberInput
        value={finishSizeHeight}
        onChange={(value) => setFinishSizeHeight(value)}
        required
        id="finishSizeHeight"
        label="Finish Size Height"
      />
      <NumberInput
        value={turningRate}
        onChange={(value) => setTurningRate(value)}
        required
        id="turningRate"
        label="Turning Rate"
      />
      <NumberInput
        value={teethCount}
        onChange={(value) => setTeethCount(value)}
        required
        id="teethCount"
        label="Teeth Count"
      />
      <NumberInput
        value={module}
        onChange={(value) => setModule(value)}
        required
        id="module"
        label="Module"
      />
      <NumberInput
        value={face}
        onChange={(value) => setFace(value)}
        required
        id="face"
        label="Face"
      />
      <NumberInput
        value={weight}
        onChange={(value) => setWeight(value)}
        required
        id="weight"
        label="Weight"
      />
      <NumberInput
        value={materialCost}
        onChange={(value) => setMaterialCost(value)}
        required
        id="materialCost"
        label="Material Cost"
      />
      <NumberInput
        value={tcTgPrice}
        onChange={(value) => setTcTgPrice(value)}
        required
        id="tcTgPrice"
        label="TC/TG Price"
      />
      <NumberInput
        value={htCost}
        onChange={(value) => setHtCost(value)}
        required
        id="htCost"
        label="HT Cost"
      />
      <Input
        value={JSON.stringify(processCosts)}
        onChange={(e) => setProcessCosts(JSON.parse(e.target.value))}
        required
        id="processCosts"
        label="Process Costs"
      />
      <NumberInput
        value={grandTotal}
        onChange={(value) => setGrandTotal(value)}
        required
        id="grandTotal"
        label="Grand Total"
      />
      <NumberInput
        value={profitMargin}
        onChange={(value) => setProfitMargin(value)}
        required
        id="profitMargin"
        label="Profit Margin"
      />
      <NumberInput
        value={totalOrderValue}
        onChange={(value) => setTotalOrderValue(value)}
        required
        id="totalOrderValue"
        label="Total Order Value"
      />
      <Button type="submit">Add Quotation</Button>
    </form>
  );
};

export default NewQuotationForm;
