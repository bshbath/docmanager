import React from "react";
import styles from "./ModalFooter.module.css";
import Button from "../../atoms/Button/Button";

const ModalFooter = ({
  pages = [1, 2, 3],
  onNext,
  onPrevious,
  selectedPageIndex = 0,
  onSelectPage,
}) => {
  const selected = pages[selectedPageIndex];
  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.pages}`}>
        {pages.map((pageNumber, index) => {
          return (
            <div>
              <Button
                variant={
                  selected == pageNumber
                    ? "selectedPageNumberButton"
                    : "pageNumberButton"
                }
                textSize={
                  selected == pageNumber
                    ? "selectedPageNumberTextSize"
                    : "pageNumberTextSize"
                }
                round={true}
                label={pageNumber}
                onClick={() => onSelectPage(index)}
              />
            </div>
          );
        })}
      </div>
      <div className={`${styles.controlButtons}`}>
        <Button
          onClick={onPrevious}
          label="Previous"
          variant="modalPrevNextButton"
          chevron="left"
          disabled={selectedPageIndex === 0}
        />
        <Button
          onClick={onNext}
          label="Next"
          variant="modalPrevNextButton"
          chevron="right"
          disabled={selectedPageIndex === pages.length - 1}
        />
      </div>
    </div>
  );
};

export default ModalFooter;
