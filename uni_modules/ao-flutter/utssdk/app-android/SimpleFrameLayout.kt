package simple

import android.content.Context
import android.util.Log
import android.widget.FrameLayout

/**
 * Flutter会议容器
 * 基于FrameLayout的自定义控件
 */
class SimpleFrameLayout(context: Context) : FrameLayout(context) {
    
    private val TAG = "FlutterMeeting"
    
    init {
        Log.d(TAG, "初始化Flutter会议容器")
    }
    
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d(TAG, "Flutter会议容器已附加到窗口")
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        Log.d(TAG, "Flutter会议容器已从窗口分离")
    }
    
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        Log.d(TAG, "Flutter会议容器布局: $left, $top, $right, $bottom")
    }
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        Log.d(TAG, "Flutter会议容器测量")
    }
    
    /**
     * 启动Flutter会议
     */
    fun start() {
        Log.d(TAG, "启动Flutter会议")
    }
} 