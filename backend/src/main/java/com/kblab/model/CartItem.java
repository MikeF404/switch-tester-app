@Embeddable
public class CartItem {
    private Long itemId;      // ID of either SimpleItem or SwitchTester
    private String itemType;  // "SIMPLE_ITEM" or "SWITCH_TESTER"
    private Integer quantity;

    // Constructors, getters, setters
    public CartItem() {}

    public CartItem(Long itemId, String itemType, Integer quantity) {
        this.itemId = itemId;
        this.itemType = itemType;
        this.quantity = quantity;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
} 