"use client";
import React, { useState } from "react";
import { Button, Input, NumberInput, Select } from "@/once-ui/components";
import OrderService from "@/services/orders/orders.service";

const profileTypes = ["Pinion", "Gear"];
const materialTypes = ["CR_5", "EN_9"];

const NewOrderProfileForm: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState(profileTypes[0]);
  const [material, setMaterial] = useState(materialTypes[0]);
  const [materialRate, setMaterialRate] = useState(0);
  const [cutSizeWidth, setCutSizeWidth] = useState(0);
  const [cutSizeHeight, setCutSizeHeight] = useState(0);
  const [burningWastage, setBurningWastage] = useState(0);
  const [heatTreatmentRate, setHeatTreatmentRate] = useState(0);
  const [heatTreatmentInefficacy, setHeatTreatmentInefficacy] = useState(0);
  const [availableInventory, setAvailableInventory] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await OrderService.createOrderProfile({
        name,
        type,
        material,
        materialRate,
        cutSizeWidth,
        cutSizeHeight,
        burningWastage,
        heatTreatmentRate,
        heatTreatmentInefficacy,
        availableInventory,
      });
      if (response) {
        alert("Order profile added successfully");
        setName("");
        setType(profileTypes[0]);
        setMaterial(materialTypes[0]);
        setMaterialRate(0);
        setCutSizeWidth(0);
        setCutSizeHeight(0);
        setBurningWastage(0);
        setHeatTreatmentRate(0);
        setHeatTreatmentInefficacy(0);
        setAvailableInventory(0);
      }
    } catch (error) {
      console.error("Error adding order profile:", error);
      alert("Failed to add order profile");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        id="name"
        label="Name"
      />
      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
        id="type"
        label="Type"
        options={profileTypes.map((type) => ({ value: type, label: type }))}
      />
      <Select
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        required
        id="material"
        label="Material"
        options={materialTypes.map((material) => ({ value: material, label: material }))}
      />
      <NumberInput
        value={materialRate}
        onChange={(value) => setMaterialRate(value)}
        required
        id="materialRate"
        label="Material Rate"
      />
      <NumberInput
        value={cutSizeWidth}
        onChange={(value) => setCutSizeWidth(value)}
        required
        id="cutSizeWidth"
        label="Cut Size Width"
      />
      <NumberInput
        value={cutSizeHeight}
        onChange={(value) => setCutSizeHeight(value)}
        required
        id="cutSizeHeight"
        label="Cut Size Height"
      />
      <NumberInput
        value={burningWastage}
        onChange={(value) => setBurningWastage(value)}
        required
        id="burningWastage"
        label="Burning Wastage"
      />
      <NumberInput
        value={heatTreatmentRate}
        onChange={(value) => setHeatTreatmentRate(value)}
        required
        id="heatTreatmentRate"
        label="Heat Treatment Rate"
      />
      <NumberInput
        value={heatTreatmentInefficacy}
        onChange={(value) => setHeatTreatmentInefficacy(value)}
        required
        id="heatTreatmentInefficacy"
        label="Heat Treatment Inefficacy"
      />
      <NumberInput
        value={availableInventory}
        onChange={(value) => setAvailableInventory(value)}
        required
        id="availableInventory"
        label="Available Inventory"
      />
      <Button type="submit">Add Order Profile</Button>
    </form>
  );
};

export default NewOrderProfileForm;
