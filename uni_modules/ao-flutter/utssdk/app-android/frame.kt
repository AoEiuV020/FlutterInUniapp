package flutter

import androidx.core.app.ActivityCompat;
import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentTransaction

/**
 * Flutter容器
 * 基于FrameLayout的自定义控件
 */
class FlutterFrameLayout(context: Context) : FrameLayout(context) {
    
    private val TAG = "FlutterContainer"
    private lateinit var flutterFragment: Fragment
    
    init {
        Log.d(TAG, "初始化Flutter容器")
        // 初始化Flutter Fragment
        initFlutterFragment()
    }
    
    /**
     * 初始化Flutter Fragment
     */
    private fun initFlutterFragment() {
        // 直接强制使用FragmentActivity
        val activity = context as FragmentActivity
        
        // 使用反射创建Fragment
        try {
            val fragmentClass = Class.forName("flutter.SubFlutterFragment")
            val createMethod = fragmentClass.getMethod("create")
            flutterFragment = createMethod.invoke(null) as Fragment
            
            // 确保FrameLayout有一个ID，否则Fragment无法添加
            if (id == NO_ID) {
                id = generateViewId()
            }
            
            val transaction = activity.supportFragmentManager.beginTransaction()
            transaction.replace(id, flutterFragment)
            transaction.commit()
        } catch (e: Exception) {
            Log.e(TAG, "创建Fragment失败", e)
        }
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
     * 获取Flutter Fragment
     */
    fun getFlutterFragment(): Fragment {
        return flutterFragment
    }
} 