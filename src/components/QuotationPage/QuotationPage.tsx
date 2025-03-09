import React from "react";
import styles from "./QuotationPage.module.scss";
import { Input } from "@/once-ui/components";

const QuotationPage = () => {
  return (
    <div className={styles.QuotationPageContainer}>
      <form className={styles.formForQuotation}>
        <Input label="Name" id={"name"} />
        <Input label="Email" id="email" />
      </form>
    </div>
  );
};
export default QuotationPage;
