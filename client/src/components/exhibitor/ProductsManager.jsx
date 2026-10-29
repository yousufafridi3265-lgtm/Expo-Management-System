import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { updateMyExhibitorProfile } from "../../apis/exhibitorApi";
import { notifyError, notifySuccess } from "../../utils/notify";

// Backend products ki poori list ek saath badalta hai, isliye jab bhi jodna ya hatana ho to nayi poori list bhejte hain
const cleanProducts = (products) => products.map(({ name, description }) => ({ name, description: description || "" }));

// products: abhi ki list. onChanged(profile): save ke baad backend ka naya profile
const ProductsManager = ({ products, onChanged }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);

  // Nayi list backend ko bhejta hai. Kamyabi par true wapas deta hai
  const saveProducts = async (nextProducts, successMessage) => {
    setSaving(true);
    try {
      const response = await updateMyExhibitorProfile({ products: cleanProducts(nextProducts) });
      onChanged(response.data);
      notifySuccess(successMessage);
      return true;
    } catch (error) {
      notifyError(error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return setNameError("Product name is required");
    if (trimmedName.length > 100) return setNameError("Product name must be at most 100 characters");

    const added = await saveProducts(
      [...products, { name: trimmedName, description: description.trim() }],
      "Product added"
    );
    if (added) {
      setName("");
      setDescription("");
      setNameError("");
    }
  };

  const handleRemove = async () => {
    const nextProducts = products.filter((_, index) => index !== removeIndex);
    const removed = await saveProducts(nextProducts, "Product removed");
    if (removed) setRemoveIndex(null);
  };

  return (
    <div className="products-manager">
      {products.length === 0 ? (
        <p className="registration-note">No products yet. Add your first product below.</p>
      ) : (
        <ul className="product-list">
          {products.map((product, index) => (
            <li key={`${product.name}-${index}`} className="product-item product-item-row">
              <div>
                <p className="product-name">{product.name}</p>
                {product.description && <p className="feature-text">{product.description}</p>}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setRemoveIndex(index)}
                aria-label={`Remove ${product.name}`}
              >
                <FiTrash2 aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="auth-form" noValidate>
        <h3 className="form-section-title">Add a product</h3>
        <Input
          label="Product name"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
          }}
          error={nameError}
        />
        <Textarea label="Description (optional)" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        <div>
          <Button type="submit" loading={saving && removeIndex === null}>
            Add product
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        open={removeIndex !== null}
        title="Remove this product?"
        message={removeIndex !== null ? `"${products[removeIndex]?.name}" will be removed from your public profile.` : ""}
        confirmText="Remove"
        danger
        loading={saving}
        onConfirm={handleRemove}
        onCancel={() => setRemoveIndex(null)}
      />
    </div>
  );
};

export default ProductsManager;