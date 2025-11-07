"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Quotation } from "@prisma/client";
import { Heading } from "@/once-ui/components";

const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [buyers, setBuyers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get("/api/quotations");
        setQuotations(response.data.quotations);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };

    const fetchBuyers = async () => {
      try {
        const response = await axios.get("/api/buyers");
        const buyersData = response.data.buyers.reduce(
          (acc: any, buyer: any) => {
            acc[buyer.id] = buyer.name;
            return acc;
          },
          {}
        );
        setBuyers(buyersData);
      } catch (error) {
        console.error("Error fetching buyers:", error);
      }
    };

    fetchQuotations();
    fetchBuyers();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px"
      }}
    >
      <Heading>Quotations</Heading>
      <table>
        <thead>
          <tr>
            <th>Buyer Name</th>
            <th>PO Number</th>
            <th>Profile ID</th>
            <th>Finish Size Width</th>
            <th>Finish Size Height</th>
            <th>Turning Rate</th>
            <th>Teeth Count</th>
            <th>Module</th>
            <th>Face</th>
            <th>Weight</th>
            <th>Material Cost</th>
            <th>TC/TG Price</th>
            <th>HT Cost</th>
            <th>Process Costs</th>
            <th>Grand Total</th>
            <th>Profit Margin</th>
            <th>Total Order Value</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quotation) => (
            <tr key={quotation.id}>
              <td>{buyers[quotation.purchaserId]}</td>
              <td>{quotation.poNumber}</td>
              <td>{quotation.profileId}</td>
              <td>{quotation.finishSizeWidth}</td>
              <td>{quotation.finishSizeHeight}</td>
              <td>{quotation.turningRate}</td>
              <td>{quotation.teethCount}</td>
              <td>{quotation.module}</td>
              <td>{quotation.face}</td>
              <td>{quotation.weight}</td>
              <td>{quotation.materialCost}</td>
              <td>{quotation.tcTgPrice}</td>
              <td>{quotation.htCost}</td>
              <td>{JSON.stringify(quotation.processCosts)}</td>
              <td>{quotation.grandTotal}</td>
              <td>{quotation.profitMargin}</td>
              <td>{quotation.totalOrderValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationsPage;
