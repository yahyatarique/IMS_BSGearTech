"use client";
import React, { useState } from "react";
import { Button, Input } from "@/once-ui/components";
import axios from "axios";

const NewBuyerForm: React.FC = () => {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/buyers", {
        name,
        contactName,
        mobile,
        gstNumber,
        panNumber,
        tinNumber,
        orgName,
        orgAddress,
      });
      if (response.status === 200) {
        alert("Buyer added successfully");
        setName("");
        setContactName("");
        setMobile("");
        setGstNumber("");
        setPanNumber("");
        setTinNumber("");
        setOrgName("");
        setOrgAddress("");
      }
    } catch (error) {
      console.error("Error adding buyer:", error);
      alert("Failed to add buyer");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Example Input */}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        id="name"
        label="Name"
      />
      <Input
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        required
        id="contactName"
        label="Contact Name"
      />
      <Input
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        required
        id="mobile"
        label="Mobile"
      />
      <Input
        value={gstNumber}
        onChange={(e) => setGstNumber(e.target.value)}
        id="gstNumber"
        label="GST Number"
      />
      <Input
        value={panNumber}
        onChange={(e) => setPanNumber(e.target.value)}
        id="panNumber"
        label="PAN Number"
      />
      <Input
        value={tinNumber}
        onChange={(e) => setTinNumber(e.target.value)}
        id="tinNumber"
        label="TIN Number"
      />
      <Input
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        required
        id="orgName"
        label="Organization Name"
      />
      <Input
        value={orgAddress}
        onChange={(e) => setOrgAddress(e.target.value)}
        required
        id="orgAddress"
        label="Organization Address"
      />
      <Button type="submit">Add Buyer</Button>
    </form>
  );
};

export default NewBuyerForm;
