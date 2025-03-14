package flutter

import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import android.view.ViewGroup
import android.graphics.Color
import android.widget.Button
import android.view.Gravity
import android.widget.ImageView
import android.view.View

/**
 * Flutter容器
 * 基于FrameLayout的自定义控件
 */
class FlutterFrameLayout(context: Context) : FrameLayout(context) {
    
    private val TAG = "FlutterContainer"
    private lateinit var bottomButton: Button
    private lateinit var backgroundImageView: ImageView
    
    init {
        Log.d(TAG, "初始化Flutter容器")
        // 初始化背景ImageView
        initBackgroundImageView()
        
        // 创建底部按钮
        initBottomButton()
    }
    
    /**
     * 初始化背景ImageView
     */
    private fun initBackgroundImageView() {
        backgroundImageView = ImageView(context).apply {
            // 设置布局参数，确保填充整个容器
            val params = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
            layoutParams = params
            
            // 设置默认背景色
            setBackgroundColor(Color.LTGRAY)
            
            // 设置缩放类型
            scaleType = ImageView.ScaleType.CENTER_CROP
            
            // 设置层级，确保在最底层
            elevation = 0f
        }
        
        // 将ImageView添加到容器中
        addView(backgroundImageView, 0) // 添加到索引0，确保它在最底层
    }
    
    /**
     * 初始化底部按钮
     */
    private fun initBottomButton() {
        bottomButton = Button(context).apply {
            text = "底部按钮"
            setBackgroundColor(Color.RED)
            
            // 设置按钮布局参数
            val params = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT
            )
            params.gravity = Gravity.BOTTOM
            layoutParams = params
            
            // 设置按钮点击事件
            setOnClickListener {
                Log.d(TAG, "底部按钮被点击")
            }
        }
        
        // 将按钮添加到容器中
        addView(bottomButton)
    }
    
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d(TAG, "Flutter容器已附加到窗口")
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        Log.d(TAG, "Flutter容器已从窗口分离")
    }
    
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        Log.d(TAG, "Flutter容器布局: $left, $top, $right, $bottom")
    }
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        Log.d(TAG, "Flutter容器测量")
    }
    
    /**
     * 启动Flutter
     */
    fun start() {
        Log.d(TAG, "启动Flutter")
    }
    
    /**
     * 获取底部按钮
     */
    fun getBottomButton(): Button {
        return bottomButton
    }
    
    /**
     * 设置按钮文本
     */
    fun setButtonText(text: String) {
        bottomButton.text = text
    }
    
    /**
     * 设置按钮点击监听器
     */
    fun setButtonClickListener(listener: OnClickListener) {
        bottomButton.setOnClickListener(listener)
    }
    
    /**
     * 设置背景图片资源ID
     */
    fun setBackgroundImageResource(resourceId: Int) {
        backgroundImageView.setImageResource(resourceId)
    }
    
    /**
     * 获取背景ImageView
     */
    fun getBackgroundImageView(): ImageView {
        return backgroundImageView
    }
} 