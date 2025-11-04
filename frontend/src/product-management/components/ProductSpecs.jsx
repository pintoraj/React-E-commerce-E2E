import React from "react";
import "./css/ProductSpecs.css"; // Imports the stylesheet

const ProductSpecs = ({ product }) => {
  // Use product.specifications based on your ProductDetailPage component
  const specs = product.specifications || {};
  const specEntries = Object.entries(specs);

  return (
    <div className="p-specs-wrapper">
      <h3>Product Specifications</h3>

      {specEntries.length === 0 ? (
        <p>No specifications available for this product.</p>
      ) : (
        <div className="p-specs-table-container">
          <table>
            <tbody>
              {specEntries.map(([key, value]) => (
                <tr key={key}>
                  <td className="p-spec-key">{key}</td>
                  <td className="p-spec-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductSpecs;