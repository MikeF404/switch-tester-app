public class CustomTesterRequest {
    private List<Long> switchIds;
    private boolean includesKeycaps;
    
    // Getters, setters
    public List<Long> getSwitchIds() {
        return switchIds;
    }

    public void setSwitchIds(List<Long> switchIds) {
        this.switchIds = switchIds;
    }

    public boolean isIncludesKeycaps() {
        return includesKeycaps;
    }

    public void setIncludesKeycaps(boolean includesKeycaps) {
        this.includesKeycaps = includesKeycaps;
    }
    
} 